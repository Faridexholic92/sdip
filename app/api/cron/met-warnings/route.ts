import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const warningCategories = [
  "THUNDERSTORM2",
  "RAIN2",
  "WINDSEA2",
  "CYCLONE2",
  "QUAKETSUNAMI2"
];

type MetWarning = {
  date?: string;
  datatype?: string;
  value?: {
    heading?: {
      ms?: string;
      en?: string;
    };
    text?: {
      ms?: {
        warning?: string;
        earthquake?: string;
        tsunami?: string;
      };
      en?: {
        warning?: string;
        earthquake?: string;
        tsunami?: string;
      };
    };
  };
  attributes?: {
    timestamp?: string | null;
    valid_from?: string | null;
    valid_to?: string | null;
    title?: {
      ms?: string;
      en?: string;
    };
  };
};

type MetResponse = {
  metadata?: {
    resultset?: {
      count?: number;
    };
  };
  results?: MetWarning[];
};

function getMalaysiaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const year = parts.find(
    (part) => part.type === "year"
  )?.value;

  const month = parts.find(
    (part) => part.type === "month"
  )?.value;

  const day = parts.find(
    (part) => part.type === "day"
  )?.value;

  return `${year}-${month}-${day}`;
}

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || !authorization) {
    return false;
  }

  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const received = Buffer.from(authorization);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

function getMalayText(item: MetWarning) {
  const text = item.value?.text?.ms;

  if (!text) {
    return "";
  }

  return [
    text.warning,
    text.earthquake,
    text.tsunami
  ]
    .filter(Boolean)
    .join(" ");
}

function getEnglishText(item: MetWarning) {
  const text = item.value?.text?.en;

  if (!text) {
    return "";
  }

  return [
    text.warning,
    text.earthquake,
    text.tsunami
  ]
    .filter(Boolean)
    .join(" ");
}

function extractSabahSection(text: string) {
  const marker = "Sabah:";
  const start = text.indexOf(marker);

  if (start === -1) {
    return null;
  }

  const fromSabah = text.slice(start);

  const possibleEndMarkers = [
    "• W.P. Labuan",
    "• WP Labuan",
    "• Sarawak:",
    "• Sarawak"
  ];

  let end = fromSabah.length;

  for (const endMarker of possibleEndMarkers) {
    const position = fromSabah.indexOf(endMarker);

    if (position > 0 && position < end) {
      end = position;
    }
  }

  return fromSabah.slice(0, end).trim();
}

function createFingerprint(
  category: string,
  item: MetWarning,
  warningText: string
) {
  const sourceValue = [
    category,
    item.datatype ?? "",
    item.date ?? "",
    item.attributes?.timestamp ?? "",
    item.attributes?.valid_from ?? "",
    item.attributes?.valid_to ?? "",
    warningText
  ].join("|");

  return createHash("sha256")
    .update(sourceValue)
    .digest("hex");
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        status: "unauthorized"
      },
      {
        status: 401
      }
    );
  }

  const baseUrl = process.env.METMALAYSIA_API_URL;
  const metToken = process.env.METMALAYSIA_API_TOKEN;

  if (!baseUrl || !metToken) {
    return NextResponse.json(
      {
        status: "not_configured",
        message: "MetMalaysia variables are missing."
      },
      {
        status: 503
      }
    );
  }

  const today = getMalaysiaDate();
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");

  let recordsReceived = 0;
  let sabahRecords = 0;
  let savedRecords = 0;

  const errors: Array<{
    category: string;
    message: string;
  }> = [];

  for (const category of warningCategories) {
    try {
      const apiUrl = new URL(`${cleanBaseUrl}/data`);

      apiUrl.searchParams.set("datasetid", "WARNING");
      apiUrl.searchParams.set(
        "datacategoryid",
        category
      );
      apiUrl.searchParams.set("start_date", today);
      apiUrl.searchParams.set("end_date", today);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `METToken ${metToken}`,
          "User-Agent": "SDIP-Cron/0.1"
        },
        cache: "no-store"
      });

      if (!response.ok) {
        errors.push({
          category,
          message: `MetMalaysia returned ${response.status}`
        });

        continue;
      }

      const body = (await response.json()) as MetResponse;
      const results = body.results ?? [];

      recordsReceived += results.length;

      for (const item of results) {
        const warningMs = getMalayText(item);
        const warningEn = getEnglishText(item);

        const combinedText = [
          warningMs,
          warningEn
        ].join(" ");

        const affectsSabah =
          combinedText.toLowerCase().includes("sabah");

        if (!affectsSabah) {
          continue;
        }

        sabahRecords += 1;

        const sabahSectionMs =
          extractSabahSection(warningMs);

        const fingerprint = createFingerprint(
          category,
          item,
          warningMs || warningEn
        );

        const publishedAt =
          item.date ??
          item.attributes?.timestamp ??
          null;

        const validFrom =
          item.attributes?.valid_from ?? null;

        const validTo =
          item.attributes?.valid_to ?? null;

        const headingMs =
          item.value?.heading?.ms ??
          item.attributes?.title?.ms ??
          "Amaran MetMalaysia";

        const headingEn =
          item.value?.heading?.en ??
          item.attributes?.title?.en ??
          "MetMalaysia Alert";

        await sql`
          insert into public.official_alerts (
            fingerprint,
            source_name,
            datatype,
            heading_ms,
            heading_en,
            warning_ms,
            warning_en,
            published_at,
            valid_from,
            valid_to,
            affects_sabah,
            sabah_section_ms,
            alert_status,
            raw_payload,
            first_seen_at,
            last_seen_at,
            created_at,
            updated_at
          )
          values (
            ${fingerprint},
            'MetMalaysia',
            ${item.datatype ?? category},
            ${headingMs},
            ${headingEn},
            ${warningMs || null},
            ${warningEn || null},
            ${publishedAt},
            ${validFrom},
            ${validTo},
            true,
            ${sabahSectionMs},
            ${
              validTo &&
              new Date(validTo).getTime() < Date.now()
                ? "expired"
                : "active"
            },
            ${sql.json(item)},
            now(),
            now(),
            now(),
            now()
          )
          on conflict (fingerprint)
          do update set
            heading_ms = excluded.heading_ms,
            heading_en = excluded.heading_en,
            warning_ms = excluded.warning_ms,
            warning_en = excluded.warning_en,
            valid_from = excluded.valid_from,
            valid_to = excluded.valid_to,
            sabah_section_ms =
              excluded.sabah_section_ms,
            raw_payload = excluded.raw_payload,
            last_seen_at = now(),
            updated_at = now(),
            alert_status = case
              when excluded.valid_to is not null
                and excluded.valid_to < now()
              then 'expired'
              else 'active'
            end
        `;

        savedRecords += 1;
      }
    } catch (error) {
      console.error(
        `Cron error for ${category}:`,
        error
      );

      errors.push({
        category,
        message: "Unexpected processing error"
      });
    }
  }

  await sql`
    update public.official_alerts
    set
      alert_status = 'expired',
      updated_at = now()
    where
      alert_status = 'active'
      and valid_to is not null
      and valid_to < now()
  `;

  return NextResponse.json({
    status: errors.length === 0
      ? "success"
      : "partial_success",
    source: "MetMalaysia",
    date: today,
    categoriesChecked: warningCategories.length,
    recordsReceived,
    sabahRecords,
    savedRecords,
    errors,
    completedAt: new Date().toISOString()
  });
}
