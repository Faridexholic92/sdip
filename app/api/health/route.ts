import {NextResponse} from "next/server";
export async function GET(){return NextResponse.json({status:"operational",services:{application:"online",database:process.env.DATABASE_URL?"configured":"not_configured",metMalaysia:process.env.METMALAYSIA_API_TOKEN?"configured":"not_configured",qwen:process.env.QWEN_API_KEY?"configured":"not_configured"},timestamp:new Date().toISOString()})}
