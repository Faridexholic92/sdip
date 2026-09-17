import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const allowedWarningCategories = [
  "QUAKETSUNAMI",
  "WINDSEA",
  "WINDSEA2",
  "THUNDERSTORM",
  "RAIN",
  "CYCLONE"
];

const allowedLocationCategories = [
  "STATE",
  "DISTRICT",
  "TOWN",
  "TOURISTDEST",
  "WATERS"
];

function getMalaysiaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.METMALAYSIA_API_URL;
  const token = process.env.METMALAYSIA_API_TOKEN;

  if (!baseUrl || !token) {
    return NextResponse.json(
      {
        status: "not_configured",
        message: "MetMalaysia environment variables are missing."
      },
      { status: 503 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") ?? "datatypes";
  const today = getMalaysiaDate();

  let endpoint = "";
  const upstreamParams = new URLSearchParams();

  if (type === "datatypes") {
    endpoint = "datatypes";
  } else if (type === "locations") {
    endpoint = "locations";

    const category = (
      searchParams.get("category") ?? "DISTRICT"
    ).toUpperCase();

    if (!allowedLocationCategories.includes(category)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid location category."
        },
        { status: 400 }
      );
    }

    upstreamParams.set("locationcategoryid", category);

    const offset = searchParams.get("offset");

    if (offset && /^\d+$/.test(offset)) {
      upstreamParams.set("offset", offset);
    }
  } else if (type === "forecast") {
    endpoint = "data";

    upstreamParams.set("datasetid", "FORECAST");
    upstreamParams.set("datacategoryid", "GENERAL");
    upstreamParams.set(
      "locationid",
      searchParams.get("locationid") ?? "ALL_LOCATIONS"
    );
    upstreamParams.set(
      "start_date",
      searchParams.get("start_date") ?? today
    );
    upstreamParams.set(
      "end_date",
      searchParams.get("end_date") ?? today
    );
    upstreamParams.set(
      "lang",
      searchParams.get("lang") === "en" ? "en" : "ms"
    );
  } else if (type === "warning") {
    endpoint = "data";

    const category = (
      searchParams.get("category") ?? "RAIN"
    ).toUpperCase();

    if (!allowedWarningCategories.includes(category)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid warning category."
        },
        { status: 400 }
      );
    }

    upstreamParams.set("datasetid", "WARNING");
    upstreamParams.set("datacategoryid", category);
    upstreamParams.set(
      "start_date",
      searchParams.get("start_date") ?? today
    );
    upstreamParams.set(
      "end_date",
      searchParams.get("end_date") ?? today
    );
  } else {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Invalid type. Use datatypes, locations, forecast or warning."
      },
      { status: 400 }
    );
  }

  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const apiUrl = new URL(`${cleanBaseUrl}/${endpoint}`);

  upstreamParams.forEach((value, key) => {
    apiUrl.searchParams.set(key, value);
  });

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `METToken ${token}`,
        "User-Agent": "SDIP/0.1"
      },
      next: {
        revalidate: 600
      }
    });

    const responseText = await response.text();

    let data: unknown;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        message: responseText || "Invalid response from MetMalaysia."
      };
    }

    if (!response.ok) {
      console.error("MetMalaysia API error:", {
        status: response.status,
        type
      });

      return NextResponse.json(
        {
          status: "upstream_error",
          upstreamStatus: response.status,
          message: "MetMalaysia request failed.",
          details: data
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: "success",
      source: "MetMalaysia",
      requestType: type,
      retrievedAt: new Date().toISOString(),
      data
    });
  } catch (error) {
    console.error("MetMalaysia connection error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Unable to connect to MetMalaysia."
      },
      { status: 500 }
    );
  }
}
