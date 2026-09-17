import {NextResponse} from "next/server";import {hazardPoints} from "@/lib/mock-data";
export async function GET(){return NextResponse.json({dataStatus:"SIMULATED",modelVersion:"sdip-risk-v0.1",generatedAt:new Date().toISOString(),items:hazardPoints,disclaimer:"Not an official warning."})}
