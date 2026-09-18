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

function formatCount(
  count: number
) {
  return count
    .toString()
    .padStart(2, "0");
}

export default function LiveKpis() {
  const [data, setData] =
    useState<OverviewResponse | null>(
      null
    );

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
          "Data ringkasan tidak dapat dimuatkan."
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
              Memuatkan
            </small>

            <strong>
              —
            </strong>

            <span>
              Membaca data rasmi…
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
            Status data
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

  const overview =
    data.overview;

  const coverage =
    overview.forecastCoverage;

  const unavailableLocations =
    Math.max(
      0,
      coverage.totalLocations -
        coverage.availableLocations
    );

  const kpis: KpiItem[] = [
    {
      label:
        "Amaran rasmi aktif",

      value: formatCount(
        overview.activeAlerts
      ),

      description:
        overview.activeAlerts > 0
          ? "Amaran MetMalaysia aktif"
          : "Tiada amaran aktif",

      color:
        overview.activeAlerts > 0
          ? "red"
          : ""
    },
    {
      label:
        "Lokasi ramalan",

      value:
        `${coverage.availableLocations}/${coverage.totalLocations}`,

      description:
        "Lokasi MetMalaysia Sabah",

      color: ""
    },
    {
      label:
        "Rekod ramalan",

      value: String(
        coverage.forecastRecords
      ),

      description:
        "Rekod rasmi hari ini",

      color: ""
    },
    {
      label:
        "Liputan ramalan",

      value:
        `${coverage.percentage}%`,

      description:
        coverage.percentage === 100
          ? "Liputan lengkap"
          : "Liputan rasmi semasa",

      color:
        coverage.percentage < 80
          ? "orange"
          : ""
    },
    {
      label:
        "Tiada ramalan",

      value: formatCount(
        unavailableLocations
      ),

      description:
        unavailableLocations > 0
          ? "Lokasi tanpa data semasa"
          : "Semua lokasi tersedia",

      color:
        unavailableLocations > 0
          ? "orange"
          : ""
    },
    {
      label:
        "Kemas kini terakhir",

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
