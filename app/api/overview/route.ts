import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOTAL_SABAH_LOCATIONS = 32;

type AlertCountRow = {
  active_alerts: string | number;
};

type ForecastCountRow = {
  available_locations: string | number;
  forecast_records: string | number;
  latest_forecast_update: string | null;
};

type RiskCountRow = {
  simulated_notices: string | number;
  elevated_areas: string | number;
};

type LatestAlertRow = {
  latest_alert_update: string | null;
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

function latestTimestamp(
  timestamps: Array<string | null>
) {
  const validTimestamps = timestamps
    .filter(
      (timestamp): timestamp is string =>
        Boolean(timestamp)
    )
    .map((timestamp) => ({
      timestamp,
      milliseconds:
        new Date(timestamp).getTime()
    }))
    .filter((item) =>
      Number.isFinite(item.milliseconds)
    )
    .sort(
      (a, b) =>
        b.milliseconds -
        a.milliseconds
    );

  return validTimestamps[0]?.timestamp ?? null;
}

export async function GET() {
  const today = getMalaysiaDate();

  try {
    const [
      alertRows,
      forecastRows,
      riskRows,
      latestAlertRows
    ] = await Promise.all([
      sql<AlertCountRow[]>`
        select
          count(
            distinct datatype
          ) as active_alerts
        from public.official_alerts
        where
          affects_sabah = true
          and alert_status = 'active'
          and (
            valid_to is null
            or valid_to >= now()
          )
      `,

      sql<ForecastCountRow[]>`
        select
          count(
            distinct location_id
          ) as available_locations,

          count(*) as forecast_records,

          max(
            retrieved_at
          ) as latest_forecast_update
        from public.official_forecasts
        where
          forecast_date = ${today}
      `,

      sql<RiskCountRow[]>`
        select
          count(*) filter (
            where
              lower(data_status) =
              'simulated'
          ) as simulated_notices,

          count(
            distinct district
          ) filter (
            where
              upper(risk_level) in (
                'HIGH',
                'VERY HIGH',
                'VERY_HIGH',
                'CRITICAL',
                'EXTREME'
              )
          ) as elevated_areas
        from public.risk_assessments
      `,

      sql<LatestAlertRow[]>`
        select
          max(
            last_seen_at
          ) as latest_alert_update
        from public.official_alerts
      `
    ]);

    const activeAlerts = Number(
      alertRows[0]?.active_alerts ?? 0
    );

    const availableLocations = Number(
      forecastRows[0]
        ?.available_locations ?? 0
    );

    const forecastRecords = Number(
      forecastRows[0]
        ?.forecast_records ?? 0
    );

    const simulatedNotices = Number(
      riskRows[0]
        ?.simulated_notices ?? 0
    );

    const elevatedAreas = Number(
      riskRows[0]
        ?.elevated_areas ?? 0
    );

    const forecastCoverage =
      TOTAL_SABAH_LOCATIONS > 0
        ? Math.round(
            (
              availableLocations /
              TOTAL_SABAH_LOCATIONS
            ) * 100
          )
        : 0;

    const lastDataUpdate =
      latestTimestamp([
        forecastRows[0]
          ?.latest_forecast_update ?? null,

        latestAlertRows[0]
          ?.latest_alert_update ?? null
      ]);

    return NextResponse.json(
      {
        status: "success",
        source: "SDIP Supabase",

        date: today,

        overview: {
          activeAlerts,
          simulatedNotices,
          elevatedAreas,

          forecastCoverage: {
            availableLocations,
            totalLocations:
              TOTAL_SABAH_LOCATIONS,
            percentage:
              forecastCoverage,
            forecastRecords
          },

          lastDataUpdate
        },

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
      "Overview API error:",
      error
    );

    return NextResponse.json(
      {
        status: "error",
        message:
          "Unable to retrieve dashboard overview."
      },
      {
        status: 500
      }
    );
  }
}
