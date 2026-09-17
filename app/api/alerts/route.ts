import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AlertRow = {
  id: string;
  source_name: string;
  datatype: string;
  heading_ms: string | null;
  summary_ms: string | null;
  warning_ms: string | null;
  published_at: string | null;
  valid_from: string | null;
  valid_to: string | null;
  alert_status: string;
  last_seen_at: string;
};

export async function GET() {
  try {
    const alerts = await sql<AlertRow[]>`
      select *
      from (
        select distinct on (datatype)
          id,
          source_name,
          datatype,
          heading_ms,
          coalesce(
            sabah_section_ms,
            warning_ms
          ) as summary_ms,
          warning_ms,
          published_at,
          valid_from,
          valid_to,
          alert_status,
          last_seen_at
        from public.official_alerts
        where
          affects_sabah = true
          and alert_status = 'active'
          and (
            valid_to is null
            or valid_to >= now()
          )
        order by
          datatype,
          coalesce(
            published_at,
            valid_from,
            created_at
          ) desc,
          last_seen_at desc
      ) as latest_alerts
      order by
        coalesce(
          valid_from,
          published_at
        ) desc nulls last
    `;

    return NextResponse.json(
      {
        status: "success",
        source: "Supabase PostgreSQL",
        count: alerts.length,
        retrievedAt: new Date().toISOString(),
        alerts
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
      "Active alerts API error:",
      error
    );

    return NextResponse.json(
      {
        status: "error",
        message:
          "Unable to retrieve official alerts."
      },
      {
        status: 500
      }
    );
  }
}
