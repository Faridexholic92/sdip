import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const allowedWarningCategories = [
  "QUAKETSUNAMI",
  "QUAKETSUNAMI2",
  "WINDSEA",
  "WINDSEA2",
  "THUNDERSTORM",
  "THUNDERSTORM2",
  "RAIN",
  "RAIN2",
  "CYCLONE",
  "CYCLONE2"
] as const;

const allowedLocationCategories = [
  "STATE",
  "DISTRICT",
  "TOWN",
  "TOURISTDEST",
  "WATERS"
] as const;

function getMalaysiaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isAllowedWarningCategory(category: string) {
  return allowedWarningCategories.includes(
    category as (typeof allowedWarningCategories)[number]
  );
}

function isAllowedLocationCategory(category: string) {
  return allowedLocationCategories.includes(
    category as (typeof allowedLocationCategories)[number]
  );
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
      {
        status: 503
      }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type")?.toLowerCase() ?? "datatypes";
  const today = getMalaysiaDate();

  let endpoint: "datatypes" | "locations" | "data";
  const upstreamParams = new URLSearchParams();

  if (type === "datatypes") {
    endpoint = "datatypes";
  } else if (type === "locations") {
    endpoint = "locations";

    const category = (
      searchParams.get("category") ?? "DISTRICT"
    ).toUpperCase();

    if (!isAllowedLocationCategory(category)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid location category.",
          allowedCategories: allowedLocationCategories
        },
        {
          status: 400
        }
      );
    }

    upstreamParams.set("locationcategoryid", category);

    const offset = searchParams.get("offset");

    if (offset) {
      if (!/^\d+$/.test(offset)) {
        return NextResponse.json(
          {
            status: "error",
            message: "Offset must be a positive integer."
          },
          {
            status: 400
          }
        );
      }

      upstreamParams.set("offset", offset);
    }
  } else if (type === "forecast") {
    endpoint = "data";

    const locationId =
      searchParams.get("locationid") ?? "ALL_LOCATIONS";

    const startDate =
      searchParams.get("start_date") ?? today;

    const endDate =
      searchParams.get("end_date") ?? startDate;

    const language =
      searchParams.get("lang") === "en" ? "en" : "ms";

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Dates must use YYYY-MM-DD format."
        },
        {
          status: 400
        }
      );
    }

    upstreamParams.set("datasetid", "FORECAST");
    upstreamParams.set("datacategoryid", "GENERAL");
    upstreamParams.set("locationid", locationId);
    upstreamParams.set("start_date", startDate);
    upstreamParams.set("end_date", endDate);
    upstreamParams.set("lang", language);
  } else if (type === "warning") {
    endpoint = "data";

    const category = (
      searchParams.get("category") ?? "RAIN"
    ).toUpperCase();

    const startDate =
      searchParams.get("start_date") ?? today;

    const endDate =
      searchParams.get("end_date") ?? startDate;

    if (!isAllowedWarningCategory(category)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid warning category.",
          allowedCategories: allowedWarningCategories
        },
        {
          status: 400
        }
      );
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Dates must use YYYY-MM-DD format."
        },
        {
          status: 400
        }
      );
    }

    upstreamParams.set("datasetid", "WARNING");
    upstreamParams.set("datacategoryid", category);
    upstreamParams.set("start_date", startDate);
    upstreamParams.set("end_date", endDate);
  } else {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Invalid type. Use datatypes, locations, forecast or warning."
      },
      {
        status: 400
      }
    );
  }

  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const apiUrl = new URL(`${cleanBaseUrl}/${endpoint}`);

  upstreamParams.forEach((value, key) => {
    apiUrl.searchParams.set(key, value);
  });

  try {
    const upstreamResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `METToken ${token}`,
        "User-Agent": "SDIP/0.1"
      },
      next: {
        revalidate: 600
      }
    });

    const responseText = await upstreamResponse.text();

    let data: unknown;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        message:
          responseText || "MetMalaysia returned an invalid response."
      };
    }

    if (!upstreamResponse.ok) {
      console.error("MetMalaysia API error:", {
        status: upstreamResponse.status,
        requestType: type,
        warningCategory:
          type === "warning"
            ? searchParams.get("category")
            : undefined
      });

      return NextResponse.json(
        {
          status: "upstream_error",
          source: "MetMalaysia",
          upstreamStatus: upstreamResponse.status,
          message: "MetMalaysia request failed.",
          details: data
        },
        {
          status: 502
        }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        source: "MetMalaysia",
        requestType: type,
        retrievedAt: new Date().toISOString(),
        data
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=600, stale-while-revalidate=300"
        }
      }
    );
  } catch (error) {
    console.error("MetMalaysia connection error:", error);

    return NextResponse.json(
      {
        status: "error",
        source: "MetMalaysia",
        message: "Unable to connect to MetMalaysia."
      },
      {
        status: 500
      }
    );
  }
}
