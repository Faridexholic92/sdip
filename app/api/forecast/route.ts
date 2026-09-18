import {
  NextRequest,
  NextResponse
} from "next/server";

import { sql } from "@/lib/db";

import {
  getSabahMetLocation
} from "@/lib/metMalaysiaLocations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ForecastRow = {
  location_id: string;
  location_name: string;
  location_root_id: string | null;
  location_root_name: string | null;
  forecast_date: string;
  datatype: string;
  value_text: string | null;
  value_number: string | number | null;
  unit: string | null;
  latitude: number | null;
  longitude: number | null;
  valid_from: string | null;
  valid_to: string | null;
  retrieved_at: string;
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

export async function GET(
  request: NextRequest
) {
  const locationId =
    request.nextUrl.searchParams.get(
      "locationid"
    );

  if (!locationId) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "locationid is required."
      },
      {
        status: 400
      }
    );
  }

  const location =
    getSabahMetLocation(locationId);

  if (!location) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Invalid Sabah location ID."
      },
      {
        status: 400
      }
    );
  }

  const today = getMalaysiaDate();

  try {
    const rows = await sql<ForecastRow[]>`
      select
        location_id,
        location_name,
        location_root_id,
        location_root_name,
        forecast_date::text,
        datatype,
        value_text,
        value_number,
        unit,
        latitude,
        longitude,
        valid_from,
        valid_to,
        retrieved_at
      from public.official_forecasts
      where
        location_id = ${locationId}
        and forecast_date = ${today}
      order by
        case datatype
          when 'FGM' then 1
          when 'FGA' then 2
          when 'FGN' then 3
          when 'FMAXT' then 4
          when 'FMINT' then 5
          when 'FSIGW' then 6
          else 99
        end
    `;

    const results = rows.map(
      (row) => {
        let value:
          | string
          | number
          | null = row.value_text;

        if (
          row.value_number !== null
        ) {
          const parsedNumber = Number(
            row.value_number
          );

          value = Number.isFinite(
            parsedNumber
          )
            ? parsedNumber
            : row.value_text;
        }

        return {
          locationid:
            row.location_id,

          locationname:
            row.location_name,

          locationrootid:
            row.location_root_id,

          locationrootname:
            row.location_root_name,

          date:
            `${row.forecast_date}T00:00:00+08:00`,

          datatype:
            row.datatype,

          value,

          latitude:
            row.latitude,

          longitude:
            row.longitude,

          attributes: {
            unit:
              row.unit,

            valid_from:
              row.valid_from,

            valid_to:
              row.valid_to
          }
        };
      }
    );

    const latestRetrievedAt =
      rows.reduce<string | null>(
        (latest, row) => {
          if (!latest) {
            return row.retrieved_at;
          }

          return new Date(
            row.retrieved_at
          ).getTime() >
            new Date(latest).getTime()
            ? row.retrieved_at
            : latest;
        },
        null
      );

    return NextResponse.json(
      {
        status: "success",

        source:
          "MetMalaysia via SDIP Supabase",

        requestType: "forecast",

        retrievedAt:
          latestRetrievedAt ??
          new Date().toISOString(),

        data: {
          metadata: {
            resultset: {
              count: results.length,
              locationid:
                locationId,
              locationname:
                location.name,
              datasetid:
                "FORECAST",
              datacategoryid:
                "GENERAL",
              forecast_date:
                today
            }
          },

          results
        }
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=300"
        }
      }
    );
  } catch (error) {
    console.error(
      "Forecast database error:",
      error
    );

    return NextResponse.json(
      {
        status: "error",
        message:
          "Unable to retrieve forecast data."
      },
      {
        status: 500
      }
    );
  }
}
