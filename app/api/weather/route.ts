import {NextResponse} from "next/server";
export async function GET(){if(!process.env.METMALAYSIA_API_TOKEN)return NextResponse.json({status:"NOT_CONFIGURED",data:[],message:"Configure MetMalaysia credentials and endpoint mapping."});return NextResponse.json({status:"CONNECTOR_STUB",data:[],message:"Implement validated endpoint adapter before production use."})}
