"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";

type OfficialAlertRow = {
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

type AlertsResponse = {
  status: string;
  source: string;
  count: number;
  retrievedAt: string;
  alerts: OfficialAlertRow[];
};

function formatMalaysiaTime(
  timestamp: string | null
) {
  if (!timestamp) {
    return "Tidak dinyatakan";
  }

  return new Date(timestamp).toLocaleString(
    "ms-MY",
    {
      timeZone: "Asia/Kuala_Lumpur",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

function isStillActive(
  alert: OfficialAlertRow
) {
  if (
    alert.alert_status !== "active"
  ) {
    return false;
  }

  if (!alert.valid_to) {
    return true;
  }

  const validTo =
    new Date(alert.valid_to).getTime();

  if (!Number.isFinite(validTo)) {
    return true;
  }

  return validTo >= Date.now();
}

function getAlertLabel(datatype: string) {
  if (
    datatype === "THUNDERSTORM" ||
    datatype === "THUNDERSTORM2"
  ) {
    return "DARATAN";
  }

  if (
    datatype === "WINDSEA" ||
    datatype === "WINDSEA2"
  ) {
    return "MARITIM";
  }

  if (
    datatype === "QUAKETSUNAMI" ||
    datatype === "QUAKETSUNAMI2"
  ) {
    return "SEISMIK";
  }

  if (
    datatype === "RAIN" ||
    datatype === "RAIN2"
  ) {
    return "HUJAN";
  }

  if (
    datatype === "CYCLONE" ||
    datatype === "CYCLONE2"
  ) {
    return "SIKLON";
  }

  return "RASMI";
}

function cleanSummary(
  alert: OfficialAlertRow
) {
  const summary =
    alert.summary_ms ??
    alert.warning_ms ??
    "Maklumat lanjut tidak tersedia.";

  return summary
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function OfficialAlert() {
  const [alerts, setAlerts] = useState<
    OfficialAlertRow[]
  >([]);

  const [retrievedAt, setRetrievedAt] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadAlerts = useCallback(
    async () => {
      try {
        setError("");

        const response = await fetch(
          "/api/alerts",
          {
            cache: "no-store"
          }
        );

        if (!response.ok) {
          throw new Error(
            "Official alerts request failed"
          );
        }

        const result =
          (await response.json()) as AlertsResponse;

        if (result.status !== "success") {
          throw new Error(
            "Official alerts API returned an error"
          );
        }

        const activeAlerts =
          (result.alerts ?? []).filter(
            isStillActive
          );

        setAlerts(activeAlerts);

        setRetrievedAt(
          result.retrievedAt
        );
      } catch (requestError) {
        console.error(
          "Official alerts error:",
          requestError
        );

        setError(
          "Status amaran rasmi tidak dapat dimuatkan."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAlerts();

    const refreshTimer =
      window.setInterval(
        loadAlerts,
        10 * 60 * 1000
      );

    return () => {
      window.clearInterval(
        refreshTimer
      );
    };
  }, [loadAlerts]);

  if (loading) {
    return (
      <div className="advisory">
        <b>SEMAKAN RASMI</b>

        <span>
          <strong>
            Memuatkan amaran MetMalaysia…
          </strong>

          <small>
            Data sedang dibaca daripada
            pangkalan data SDIP.
          </small>
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="advisory">
        <b>DATA TERGENDALA</b>

        <span>
          <strong>
            Status amaran tidak dapat disahkan
          </strong>

          <small>
            {error} Sila rujuk portal rasmi
            MetMalaysia sementara waktu.
          </small>
        </span>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="advisory">
        <b>TIADA AMARAN</b>

        <span>
          <strong>
            Tiada amaran MetMalaysia aktif
            yang dikenal pasti berkaitan Sabah
          </strong>

          <small>
            Semakan automatik dijalankan setiap
            10 minit.
            {retrievedAt
              ? ` Semakan terakhir: ${formatMalaysiaTime(
                  retrievedAt
                )}.`
              : ""}
          </small>
        </span>
      </div>
    );
  }

  return (
    <div className="advisory">
      <b>
        {alerts.length} AMARAN RASMI
      </b>

      <span
        style={{
          display: "grid",
          gap: "14px",
          width: "100%"
        }}
      >
        {alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              borderBottom:
                "1px solid rgba(255,255,255,0.18)",
              paddingBottom: "12px"
            }}
          >
            <small
              style={{
                display: "block",
                fontWeight: 700,
                letterSpacing: "0.08em",
                marginBottom: "4px"
              }}
            >
              {getAlertLabel(
                alert.datatype
              )}
              {" · "}
              {alert.datatype}
            </small>

            <strong
              style={{
                display: "block",
                marginBottom: "5px"
              }}
            >
              {alert.heading_ms ??
                "Amaran MetMalaysia"}
            </strong>

            <small
              style={{
                display: "block",
                whiteSpace: "pre-line",
                lineHeight: 1.5
              }}
            >
              {cleanSummary(alert)}
            </small>

            <small
              style={{
                display: "block",
                marginTop: "7px",
                opacity: 0.85
              }}
            >
              Sah dari{" "}
              {formatMalaysiaTime(
                alert.valid_from
              )}
              {" hingga "}
              {formatMalaysiaTime(
                alert.valid_to
              )}
              {" · Sumber: "}
              {alert.source_name}
            </small>
          </div>
        ))}

        <small
          style={{
            display: "block",
            opacity: 0.8
          }}
        >
          Dikemas kini daripada pangkalan
          data SDIP pada{" "}
          {formatMalaysiaTime(
            retrievedAt
          )}
          . Semakan automatik setiap
          10 minit.
        </small>
      </span>
    </div>
  );
}
