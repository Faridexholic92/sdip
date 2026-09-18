import { NextResponse } from "next/server";

import { sql } from "@/lib/db";

import {
  SABAH_MET_LOCATIONS
} from "@/lib/metMalaysiaLocations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ForecastSummaryRow = {
  location_id: string;
  location_name: string;
  morning: string | null;
  afternoon: string | null;
  night: string | null;
  significant_weather: string | null;
  minimum_temperature:
    | string
    | number
    | null;
  maximum_temperature:
    | string
    | number
    | null;
  last_updated: string | null;
};

type RiskSummaryRow = {
  id: string;
  district: string;
  hazard_type: string;
  overall_score:
    | string
    | number;
  risk_level: string;
  confidence_score:
    | string
    | number;
  data_status: string;
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

function normalizeName(
  value: string
) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(
  value: string | number | null
) {
  if (value === null) {
    return null;
  }

  const result = Number(value);

  return Number.isFinite(result)
    ? result
    : null;
}

export async function GET() {
  const today = getMalaysiaDate();

  try {
    const forecastRows =
      await sql<ForecastSummaryRow[]>`
        select
          location_id,
          max(location_name)
            as location_name,

          max(value_text) filter (
            where datatype = 'FGM'
          ) as morning,

          max(value_text) filter (
            where datatype = 'FGA'
          ) as afternoon,

          max(value_text) filter (
            where datatype = 'FGN'
          ) as night,

          max(value_text) filter (
            where datatype = 'FSIGW'
          ) as significant_weather,

          max(value_number) filter (
            where datatype = 'FMINT'
          ) as minimum_temperature,

          max(value_number) filter (
            where datatype = 'FMAXT'
          ) as maximum_temperature,

          max(retrieved_at)
            as last_updated

        from public.official_forecasts

        where
          forecast_date = ${today}

        group by
          location_id
      `;

    /*
     * Query kedua dijalankan selepas query
     * pertama, bukan serentak. Ini sesuai
     * dengan max: 1 dalam lib/db.ts.
     */
    const riskRows =
      await sql<RiskSummaryRow[]>`
        select
          id,
          district,
          hazard_type,
          overall_score,
          risk_level,
          confidence_score,
          data_status
        from public.risk_assessments
        order by district
      `;

    const districts =
      SABAH_MET_LOCATIONS.map(
        (location) => {
          const forecast =
            forecastRows.find(
              (row) =>
                row.location_id ===
                location.id
            );

          const risks =
            riskRows.filter(
              (risk) =>
                normalizeName(
                  risk.district
                ) ===
                normalizeName(
                  location.name
                )
            );

          return {
            locationId:
              location.id,

            district:
              location.name,

            latitude:
              location.latitude,

            longitude:
              location.longitude,

            forecast: {
              available:
                Boolean(forecast),

              date: today,

              morning:
                forecast?.morning ??
                null,

              afternoon:
                forecast?.afternoon ??
                null,

              night:
                forecast?.night ??
                null,

              significantWeather:
                forecast
                  ?.significant_weather ??
                null,

              minimumTemperature:
                toNumber(
                  forecast
                    ?.minimum_temperature ??
                    null
                ),

              maximumTemperature:
                toNumber(
                  forecast
                    ?.maximum_temperature ??
                    null
                ),

              lastUpdated:
                forecast
                  ?.last_updated ??
                null,

              source: forecast
                ? "MetMalaysia"
                : null
            },

            risks: risks.map(
              (risk) => ({
                id: risk.id,

                hazardType:
                  risk.hazard_type,

                overallScore:
                  toNumber(
                    risk.overall_score
                  ),

                riskLevel:
                  risk.risk_level,

                confidenceScore:
                  toNumber(
                    risk.confidence_score
                  ),

                dataStatus:
                  risk.data_status,

                source:
                  "SDIP Supabase"
              })
            )
          };
        }
      );

    const forecastAvailable =
      districts.filter(
        (district) =>
          district.forecast.available
      ).length;

    const districtsWithRisk =
      districts.filter(
        (district) =>
          district.risks.length > 0
      ).length;

    return NextResponse.json(
      {
        status: "success",
        source: "SDIP Supabase",
        date: today,

        summary: {
          totalDistrictLocations:
            districts.length,

          forecastAvailable,

          forecastUnavailable:
            districts.length -
            forecastAvailable,

          districtsWithRisk
        },

        districts,

        retrievedAt:
          new Date().toISOString()
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
      "District monitoring API error:",
      error
    );

    return NextResponse.json(
      {
        status: "error",
        message:
          "Unable to retrieve district monitoring data."
      },
      {
        status: 500
      }
    );
  }
}
