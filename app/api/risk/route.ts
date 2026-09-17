import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      select
        id,
        district,
        hazard_type as "hazardType",
        assessment_time as "assessmentTime",
        valid_until as "validUntil",
        model_version as "modelVersion",
        hazard_score as "hazardScore",
        exposure_score as "exposureScore",
        vulnerability_score as "vulnerabilityScore",
        capacity_score as "capacityScore",
        overall_score as "overallScore",
        risk_level as "riskLevel",
        confidence_score as "confidenceScore",
        data_coverage as "dataCoverage",
        calculation_trace as "calculationTrace",
        data_status as "dataStatus"
      from public.risk_assessments
      order by assessment_time desc
      limit 100
    `;

    return NextResponse.json({
      status: "success",
      source: "Supabase PostgreSQL",
      count: rows.length,
      generatedAt: new Date().toISOString(),
      items: rows,
      disclaimer: "AI-assisted risk assessment. Not an official warning."
    });
  } catch (error) {
    console.error("Risk API error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Unable to retrieve risk assessments."
      },
      { status: 500 }
    );
  }
}
