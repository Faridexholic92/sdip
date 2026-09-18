"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";

type OverviewResponse = {
  status: string;
  source: string;
  date: string;

  overview: {
    activeAlerts: number;
    simulatedNotices: number;
    elevatedAreas: number;

    forecastCoverage: {
      availableLocations: number;
      totalLocations: number;
      percentage: number;
      forecastRecords: number;
    };

    lastDataUpdate: string | null;
    latestAlertUpdate: string | null;
    latestForecastUpdate: string | null;
  };

  retrievedAt: string;
};

type KpiItem = {
  label: string;
  value: string;
  description: string;
  color: string;
};

function formatMalaysiaTime(
  timestamp: string | null
) {
  if (!timestamp) {
    return "Belum tersedia";
  }

  return new Date(timestamp).toLocaleString(
    "ms-MY",
    {
      timeZone: "Asia/Kuala_Lumpur",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

function formatCount(count: number) {
  return count
    .toString()
    .padStart(2, "0");
}

export default function LiveKpis() {
  const [data, setData] =
    useState<OverviewResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadOverview = useCallback(
    async () => {
      try {
        setError("");

        const response = await fetch(
          "/api/overview",
          {
            cache: "no-store"
          }
        );

        if (!response.ok) {
          throw new Error(
            "Overview request failed"
          );
        }

        const result =
          (await response.json()) as
            OverviewResponse;

        if (
          result.status !== "success"
        ) {
          throw new Error(
            "Overview API returned an error"
          );
        }

        setData(result);
      } catch (requestError) {
        console.error(
          "Live KPI error:",
          requestError
        );

        setError(
          "Live KPI data is unavailable."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadOverview();

    const refreshTimer =
      window.setInterval(
        loadOverview,
        5 * 60 * 1000
      );

    return () => {
      window.clearInterval(
        refreshTimer
      );
    };
  }, [loadOverview]);

  if (loading) {
    return (
      <div className="kpis">
        {Array.from({
          length: 6
        }).map((_, index) => (
          <article key={index}>
            <small>
              Loading
            </small>

            <strong>—</strong>

            <span>
              Reading live data…
            </span>
          </article>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="kpis">
        <article>
          <small>
            Data status
          </small>

          <strong className="red">
            ERROR
          </strong>

          <span>
            {error}
          </span>
        </article>
      </div>
    );
  }

  const overview = data.overview;
  const coverage =
    overview.forecastCoverage;

  const kpis: KpiItem[] = [
    {
      label: "Official alerts",
      value: formatCount(
        overview.activeAlerts
      ),
      description:
        overview.activeAlerts > 0
          ? "Active MetMalaysia alerts"
          : "No active official alerts",
      color:
        overview.activeAlerts > 0
          ? "red"
          : ""
    },
    {
      label: "Simulated notices",
      value: formatCount(
        overview.simulatedNotices
      ),
      description:
        "Development risk records",
      color:
        overview.simulatedNotices > 0
          ? "orange"
          : ""
    },
    {
      label: "Elevated areas",
      value: formatCount(
        overview.elevatedAreas
      ),
      description:
        "High-risk database areas",
      color:
        overview.elevatedAreas > 0
          ? "red"
          : ""
    },
    {
      label: "Forecast locations",
      value:
        `${coverage.availableLocations}/${coverage.totalLocations}`,
      description:
        `${coverage.forecastRecords} official records`,
      color: ""
    },
    {
      label: "Forecast coverage",
      value:
        `${coverage.percentage}%`,
      description:
        coverage.percentage === 100
          ? "Complete location coverage"
          : "Current daily coverage",
      color:
        coverage.percentage < 80
          ? "orange"
          : ""
    },
    {
      label: "Last data update",
      value: "LIVE",
      description:
        formatMalaysiaTime(
          overview.lastDataUpdate
        ),
      color: ""
    }
  ];

  return (
    <div className="kpis">
      {kpis.map((item) => (
        <article key={item.label}>
          <small>
            {item.label}
          </small>

          <strong
            className={item.color}
          >
            {item.value}
          </strong>

          <span>
            {item.description}
          </span>
        </article>
      ))}
    </div>
  );
}
