import {
  createHash,
  timingSafeEqual
} from "crypto";

import {
  NextRequest,
  NextResponse
} from "next/server";

import { sql } from "@/lib/db";

import {
  recordIngestionRun
} from "@/lib/recordIngestionRun";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const warningCategories = [
  "THUNDERSTORM2",
  "RAIN2",
  "WINDSEA2",
  "CYCLONE2",
  "QUAKETSUNAMI2"
] as const;

const sabahKeywords = [
  "sabah",
  "sandakan",
  "lahad datu",
  "tawau",
  "semporna",
  "kinabatangan",
  "kota kinabalu",
  "kota belud",
  "ranau",
  "kudat",
  "beaufort",
  "papar",
  "penampang",
  "tuaran",
  "putatan",
  "keningau",
  "sulu"
];

type MetWarningText = {
  warning?: string;
  earthquake?: string;
  tsunami?: string;
};

type MetWarning = {
  date?: string;
  datatype?: string;

  value?: {
    heading?: {
      ms?: string;
      en?: string;
    };

    text?: {
      ms?: MetWarningText;
      en?: MetWarningText;
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
      offset?: number;
      limit?: number;
    };
  };

  results?: MetWarning[];
};

function getMalaysiaDate() {
  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).formatToParts(new Date());

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

function isAuthorized(
  request: NextRequest
) {
  const cronSecret =
    process.env.CRON_SECRET;

  const authorization =
    request.headers.get(
      "authorization"
    );

  if (!cronSecret || !authorization) {
    return false;
  }

  const expected = Buffer.from(
    `Bearer ${cronSecret}`
  );

  const received =
    Buffer.from(authorization);

  if (
    expected.length !== received.length
  ) {
    return false;
  }

  return timingSafeEqual(
    expected,
    received
  );
}

function combineWarningText(
  text?: MetWarningText
) {
  if (!text) {
    return "";
  }

  return [
    text.warning,
    text.earthquake,
    text.tsunami
  ]
    .filter(
      (value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0
    )
    .join("\n")
    .trim();
}

function getMalayText(
  item: MetWarning
) {
  return combineWarningText(
    item.value?.text?.ms
  );
}

function getEnglishText(
  item: MetWarning
) {
  return combineWarningText(
    item.value?.text?.en
  );
}

function normalizeWarningText(
  text: string
) {
  return text
    .toLowerCase()
    .replace(
      /<br\s*\/?>/gi,
      "\n"
    )
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, "\n")
    .replace(
      /\s*•\s*/g,
      " • "
    )
    .trim();
}

function isSabahRelevant(
  malayText: string,
  englishText: string
) {
  const combinedText =
    normalizeWarningText(
      `${malayText}\n${englishText}`
    );

  return sabahKeywords.some(
    (keyword) =>
      combinedText.includes(keyword)
  );
}

function extractColonSabahSection(
  text: string
) {
  const normalizedText = text
    .replace(
      /<br\s*\/?>/gi,
      "\n"
    )
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const marker = "Sabah:";

  const start =
    normalizedText.indexOf(marker);

  if (start === -1) {
    return null;
  }

  const fromSabah =
    normalizedText.slice(start);

  const possibleEndMarkers = [
    "• W.P. Labuan",
    "• WP Labuan",
    "• Wilayah Persekutuan Labuan",
    "\nSarawak:",
    "\nSarawak"
  ];

  let end = fromSabah.length;

  for (
    const endMarker
    of possibleEndMarkers
  ) {
    const position =
      fromSabah.indexOf(
        endMarker
      );

    if (
      position > 0 &&
      position < end
    ) {
      end = position;
    }
  }

  return fromSabah
    .slice(0, end)
    .trim();
}

function extractRelevantLines(
  text: string,
  language: "ms" | "en"
) {
  if (!text) {
    return null;
  }

  const exactSabahSection =
    extractColonSabahSection(text);

  if (exactSabahSection) {
    return exactSabahSection;
  }

  const cleanedText = text
    .replace(
      /<br\s*\/?>/gi,
      "\n"
    )
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const lines = cleanedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const relevantLines =
    lines.filter((line) => {
      const normalizedLine =
        line.toLowerCase();

      return sabahKeywords.some(
        (keyword) =>
          normalizedLine.includes(
            keyword
          )
      );
    });

  if (
    relevantLines.length > 0
  ) {
    return Array.from(
      new Set(relevantLines)
    ).join("\n\n");
  }

  const normalizedFullText =
    cleanedText.toLowerCase();

  const isEarthquakeText =
    normalizedFullText.includes(
      language === "ms"
        ? "gempa bumi"
        : "earthquake"
    );

  if (
    isEarthquakeText &&
    isSabahRelevant(
      language === "ms"
        ? text
        : "",
      language === "en"
        ? text
        : ""
    )
  ) {
    return cleanedText.trim();
  }

  return null;
}

function createFingerprint(
  category: string,
  item: MetWarning,
  warningText: string
) {
  const datatype =
    item.datatype ?? category;

  const validFrom =
    item.attributes?.valid_from ??
    "";

  const validTo =
    item.attributes?.valid_to ??
    "";

  const normalizedText =
    normalizeWarningText(
      warningText
    );

  const sourceValue = [
    datatype,
    validFrom,
    validTo,
    normalizedText
  ].join("|");

  return createHash("sha256")
    .update(sourceValue)
    .digest("hex");
}

function getAlertStatus(
  validTo: string | null
) {
  if (!validTo) {
    return "active";
  }

  const expiryTime =
    new Date(validTo).getTime();

  if (
    Number.isFinite(expiryTime) &&
    expiryTime < Date.now()
  ) {
    return "expired";
  }

  return "active";
}

export async function GET(
  request: NextRequest
) {
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

  const baseUrl =
    process.env.METMALAYSIA_API_URL;

  const metToken =
    process.env.METMALAYSIA_API_TOKEN;

  if (!baseUrl || !metToken) {
    return NextResponse.json(
      {
        status: "not_configured",
        message:
          "MetMalaysia variables are missing."
      },
      {
        status: 503
      }
    );
  }

  const startedAt = new Date();
  const today = getMalaysiaDate();

  const cleanBaseUrl =
    baseUrl.replace(/\/+$/, "");

  let recordsReceived = 0;
  let sabahRecords = 0;
  let savedRecords = 0;

  const errors: Array<{
    category: string;
    message: string;
  }> = [];

  for (
    const category
    of warningCategories
  ) {
    try {
      const apiUrl = new URL(
        `${cleanBaseUrl}/data`
      );

      apiUrl.searchParams.set(
        "datasetid",
        "WARNING"
      );

      apiUrl.searchParams.set(
        "datacategoryid",
        category
      );

      apiUrl.searchParams.set(
        "start_date",
        today
      );

      apiUrl.searchParams.set(
        "end_date",
        today
      );

      const response = await fetch(
        apiUrl,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",

            Authorization:
              `METToken ${metToken}`,

            "User-Agent":
              "SDIP-Cron/0.3"
          },

          cache: "no-store"
        }
      );

      if (!response.ok) {
        errors.push({
          category,
          message:
            `MetMalaysia returned ${response.status}`
        });

        continue;
      }

      const body =
        (await response.json()) as MetResponse;

      const results =
        body.results ?? [];

      recordsReceived +=
        results.length;

      for (const item of results) {
        const warningMs =
          getMalayText(item);

        const warningEn =
          getEnglishText(item);

        if (
          !warningMs &&
          !warningEn
        ) {
          continue;
        }

        const affectsSabah =
          isSabahRelevant(
            warningMs,
            warningEn
          );

        if (!affectsSabah) {
          continue;
        }

        sabahRecords += 1;

        const sabahSectionMs =
          extractRelevantLines(
            warningMs,
            "ms"
          );

        const sabahSectionEn =
          extractRelevantLines(
            warningEn,
            "en"
          );

        const fingerprint =
          createFingerprint(
            category,
            item,
            warningMs || warningEn
          );

        const publishedAt =
          item.date ??
          item.attributes
            ?.timestamp ??
          null;

        const validFrom =
          item.attributes
            ?.valid_from ??
          null;

        const validTo =
          item.attributes
            ?.valid_to ??
          null;

        const headingMs =
          item.value
            ?.heading?.ms ??
          item.attributes
            ?.title?.ms ??
          "Amaran MetMalaysia";

        const headingEn =
          item.value
            ?.heading?.en ??
          item.attributes
            ?.title?.en ??
          "MetMalaysia Alert";

        const alertStatus =
          getAlertStatus(validTo);

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
            sabah_section_en,
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
            ${
              item.datatype ??
              category
            },
            ${headingMs},
            ${headingEn},
            ${
              warningMs ||
              null
            },
            ${
              warningEn ||
              null
            },
            ${publishedAt},
            ${validFrom},
            ${validTo},
            true,
            ${sabahSectionMs},
            ${sabahSectionEn},
            ${alertStatus},
            ${sql.json(item)},
            now(),
            now(),
            now(),
            now()
          )
          on conflict (fingerprint)
          do update set
            source_name =
              excluded.source_name,

            datatype =
              excluded.datatype,

            heading_ms =
              excluded.heading_ms,

            heading_en =
              excluded.heading_en,

            warning_ms =
              excluded.warning_ms,

            warning_en =
              excluded.warning_en,

            published_at =
              excluded.published_at,

            valid_from =
              excluded.valid_from,

            valid_to =
              excluded.valid_to,

            affects_sabah =
              excluded.affects_sabah,

            sabah_section_ms =
              excluded.sabah_section_ms,

            sabah_section_en =
              excluded.sabah_section_en,

            alert_status =
              excluded.alert_status,

            raw_payload =
              excluded.raw_payload,

            last_seen_at = now(),

            updated_at = now()
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
        message:
          "Unexpected processing error"
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

  const completedAt = new Date();

  const runStatus:
    | "success"
    | "partial_success" =
      errors.length === 0
        ? "success"
        : "partial_success";

  try {
    await recordIngestionRun({
      jobType:
        "met_warnings",

      batchNumber: null,

      runStatus,

      recordsReceived,

      recordsProcessed:
        sabahRecords,

      recordsSaved:
        savedRecords,

      errorCount:
        errors.length,

      startedAt,
      completedAt,

      details: {
        date: today,

        categoriesChecked:
          warningCategories.length,

        categories:
          Array.from(
            warningCategories
          ),

        errors
      }
    });
  } catch (loggingError) {
    console.error(
      "Unable to record warning ingestion run:",
      loggingError
    );
  }

  return NextResponse.json({
    status: runStatus,
    source: "MetMalaysia",
    date: today,

    categoriesChecked:
      warningCategories.length,

    recordsReceived,
    sabahRecords,
    savedRecords,
    errors,

    completedAt:
      completedAt.toISOString()
  });
}
