import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TOTAL_SABAH_LOCATIONS = 32;

type OverviewRow = {
  active_alerts: string | number;
  available_locations: string | number;
  forecast_records: string | number;
  latest_forecast_update: string | null;
  simulated_notices: string | number;
  elevated_areas: string | number;
  latest_alert_update: string | null;
  last_data_update: string | null;
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

export async function GET() {
  const today = getMalaysiaDate();

  try {
    /*
     * Satu panggilan SQL sahaja.
     * Ini mengelakkan beberapa query berebut
     * satu sambungan serverless PostgreSQL.
     */
    const rows = await sql<OverviewRow[]>`
      with alert_stats as (
        select
          count(
            distinct datatype
          ) as active_alerts,

          max(
            last_seen_at
          ) as latest_alert_update
        from public.official_alerts
        where
          affects_sabah = true
          and alert_status = 'active'
          and (
            valid_to is null
            or valid_to >= now()
          )
      ),

      forecast_stats as (
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
      ),

      risk_stats as (
        select
          count(*) filter (
            where
              lower(
                coalesce(
                  data_status,
                  ''
                )
              ) = 'simulated'
          ) as simulated_notices,

          count(
            distinct district
          ) filter (
            where
              upper(
                coalesce(
                  risk_level,
                  ''
                )
              ) in (
                'HIGH',
                'VERY HIGH',
                'VERY_HIGH',
                'CRITICAL',
                'EXTREME'
              )
          ) as elevated_areas
        from public.risk_assessments
      )

      select
        alert_stats.active_alerts,

        forecast_stats.available_locations,
        forecast_stats.forecast_records,
        forecast_stats.latest_forecast_update,

        risk_stats.simulated_notices,
        risk_stats.elevated_areas,

        alert_stats.latest_alert_update,

        greatest(
          alert_stats.latest_alert_update,
          forecast_stats.latest_forecast_update
        ) as last_data_update

      from alert_stats
      cross join forecast_stats
      cross join risk_stats
    `;

    const row = rows[0];

    const activeAlerts = Number(
      row?.active_alerts ?? 0
    );

    const availableLocations = Number(
      row?.available_locations ?? 0
    );

    const forecastRecords = Number(
      row?.forecast_records ?? 0
    );

    const simulatedNotices = Number(
      row?.simulated_notices ?? 0
    );

    const elevatedAreas = Number(
      row?.elevated_areas ?? 0
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

          lastDataUpdate:
            row?.last_data_update ?? null,

          latestAlertUpdate:
            row?.latest_alert_update ?? null,

          latestForecastUpdate:
            row?.latest_forecast_update ?? null
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
