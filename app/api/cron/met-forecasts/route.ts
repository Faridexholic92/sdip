import {
  timingSafeEqual
} from "crypto";

import {
  NextRequest,
  NextResponse
} from "next/server";

import { sql } from "@/lib/db";

import {
  SABAH_MET_LOCATIONS
} from "@/lib/metMalaysiaLocations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH_SIZE = 8;
const SABAH_ROOT_ID = "LOCATION:13";

type MetForecast = {
  locationid: string;
  locationname: string;
  locationrootid: string;
  locationrootname: string;
  date: string;
  datatype: string;
  value: string | number;
  latitude: number | null;
  longitude: number | null;

  attributes?: {
    unit?: string;
    code?: string;
    when?: string;
    ref?: string | null;
    valid_from?: string | null;
    valid_to?: string | null;
  };
};

type MetForecastResponse = {
  metadata?: {
    resultset?: {
      count?: number;
      offset?: number;
      limit?: number;
    };
  };

  results?: MetForecast[];
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
    request.headers.get("authorization");

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

function parseBatch(
  request: NextRequest
) {
  const value =
    request.nextUrl.searchParams.get(
      "batch"
    ) ?? "0";

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const batch = Number(value);

  const totalBatches = Math.ceil(
    SABAH_MET_LOCATIONS.length /
      BATCH_SIZE
  );

  if (
    !Number.isInteger(batch) ||
    batch < 0 ||
    batch >= totalBatches
  ) {
    return null;
  }

  return batch;
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

  const batch = parseBatch(request);

  if (batch === null) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Invalid batch. Use batch 0, 1, 2 or 3."
      },
      {
        status: 400
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

  const today = getMalaysiaDate();

  const cleanBaseUrl =
    baseUrl.replace(/\/+$/, "");

  const startIndex =
    batch * BATCH_SIZE;

  const locations =
    SABAH_MET_LOCATIONS.slice(
      startIndex,
      startIndex + BATCH_SIZE
    );

  let locationsChecked = 0;
  let recordsReceived = 0;
  let recordsSaved = 0;

  const errors: Array<{
    locationId: string;
    locationName: string;
    message: string;
  }> = [];

  for (const location of locations) {
    try {
      const apiUrl = new URL(
        `${cleanBaseUrl}/data`
      );

      apiUrl.searchParams.set(
        "datasetid",
        "FORECAST"
      );

      apiUrl.searchParams.set(
        "datacategoryid",
        "GENERAL"
      );

      apiUrl.searchParams.set(
        "locationid",
        location.id
      );

      apiUrl.searchParams.set(
        "start_date",
        today
      );

      apiUrl.searchParams.set(
        "end_date",
        today
      );

      apiUrl.searchParams.set(
        "lang",
        "ms"
      );

      const response = await fetch(
        apiUrl,
        {
          method: "GET",

          headers: {
            Accept: "application/json",

            Authorization:
              `METToken ${metToken}`,

            "User-Agent":
              "SDIP-Forecast-Cron/0.1"
          },

          cache: "no-store"
        }
      );

      if (!response.ok) {
        errors.push({
          locationId: location.id,
          locationName:
            location.name,
          message:
            `MetMalaysia returned ${response.status}`
        });

        continue;
      }

      const body =
        (await response.json()) as
          MetForecastResponse;

      const results =
        body.results ?? [];

      locationsChecked += 1;
      recordsReceived += results.length;

      for (const item of results) {
        /*
         * Perlindungan tambahan:
         * simpan lokasi Sabah sahaja.
         */
        if (
          item.locationrootid !==
          SABAH_ROOT_ID
        ) {
          continue;
        }

        const forecastDate =
          item.date.slice(0, 10);

        const valueText =
          typeof item.value === "string"
            ? item.value
            : null;

        const valueNumber =
          typeof item.value === "number"
            ? item.value
            : null;

        await sql`
          insert into public.official_forecasts (
            source_name,
            location_id,
            location_name,
            location_root_id,
            location_root_name,
            forecast_date,
            datatype,
            value_text,
            value_number,
            unit,
            latitude,
            longitude,
            valid_from,
            valid_to,
            raw_payload,
            retrieved_at,
            first_seen_at,
            last_seen_at,
            created_at,
            updated_at
          )
          values (
            'MetMalaysia',
            ${item.locationid},
            ${item.locationname},
            ${item.locationrootid},
            ${item.locationrootname},
            ${forecastDate},
            ${item.datatype},
            ${valueText},
            ${valueNumber},
            ${
              item.attributes?.unit ??
              null
            },
            ${item.latitude},
            ${item.longitude},
            ${
              item.attributes
                ?.valid_from ?? null
            },
            ${
              item.attributes
                ?.valid_to ?? null
            },
            ${sql.json(item)},
            now(),
            now(),
            now(),
            now(),
            now()
          )
          on conflict (
            location_id,
            forecast_date,
            datatype
          )
          do update set
            location_name =
              excluded.location_name,

            location_root_id =
              excluded.location_root_id,

            location_root_name =
              excluded.location_root_name,

            value_text =
              excluded.value_text,

            value_number =
              excluded.value_number,

            unit =
              excluded.unit,

            latitude =
              excluded.latitude,

            longitude =
              excluded.longitude,

            valid_from =
              excluded.valid_from,

            valid_to =
              excluded.valid_to,

            raw_payload =
              excluded.raw_payload,

            retrieved_at = now(),
            last_seen_at = now(),
            updated_at = now()
        `;

        recordsSaved += 1;
      }
    } catch (error) {
      console.error(
        `Forecast error for ${location.id}:`,
        error
      );

      errors.push({
        locationId: location.id,
        locationName: location.name,
        message:
          "Unexpected processing error"
      });
    }
  }

  return NextResponse.json({
    status:
      errors.length === 0
        ? "success"
        : "partial_success",

    source: "MetMalaysia",
    date: today,
    batch,

    totalBatches: Math.ceil(
      SABAH_MET_LOCATIONS.length /
        BATCH_SIZE
    ),

    locationsRequested:
      locations.length,

    locationsChecked,
    recordsReceived,
    recordsSaved,
    errors,

    completedAt:
      new Date().toISOString()
  });
}
