"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

type OfficialAlert = {
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
  alerts: OfficialAlert[];
};

type AlertFilter =
  | "all"
  | "marine"
  | "thunderstorm"
  | "rain"
  | "earthquake"
  | "cyclone";

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

function getAlertType(
  datatype: string
): AlertFilter {
  const normalized =
    datatype.toUpperCase();

  if (
    normalized === "WINDSEA" ||
    normalized === "WINDSEA2"
  ) {
    return "marine";
  }

  if (
    normalized === "THUNDERSTORM" ||
    normalized === "THUNDERSTORM2"
  ) {
    return "thunderstorm";
  }

  if (
    normalized === "RAIN" ||
    normalized === "RAIN2"
  ) {
    return "rain";
  }

  if (
    normalized === "QUAKETSUNAMI" ||
    normalized === "QUAKETSUNAMI2"
  ) {
    return "earthquake";
  }

  if (
    normalized === "CYCLONE" ||
    normalized === "CYCLONE2"
  ) {
    return "cyclone";
  }

  return "all";
}

function getPublicTitle(
  alert: OfficialAlert
) {
  const type =
    getAlertType(
      alert.datatype
    );

  if (type === "marine") {
    return "Amaran Maritim Rasmi MetMalaysia";
  }

  if (type === "thunderstorm") {
    return "Amaran Ribut Petir Rasmi MetMalaysia";
  }

  if (type === "rain") {
    return "Amaran Hujan Berterusan Rasmi MetMalaysia";
  }

  if (type === "earthquake") {
    return "Makluman Gempa Bumi dan Tsunami Rasmi MetMalaysia";
  }

  if (type === "cyclone") {
    return "Amaran Siklon Tropika Rasmi MetMalaysia";
  }

  return (
    alert.heading_ms ??
    "Amaran Rasmi MetMalaysia"
  );
}

function getAlertColor(
  datatype: string
) {
  const type =
    getAlertType(datatype);

  if (type === "marine") {
    return "#38bdf8";
  }

  if (type === "thunderstorm") {
    return "#f59e0b";
  }

  if (type === "rain") {
    return "#3b82f6";
  }

  if (type === "earthquake") {
    return "#ef4444";
  }

  if (type === "cyclone") {
    return "#a855f7";
  }

  return "#94a3b8";
}

function getPublicSummary(
  alert: OfficialAlert
) {
  const originalText =
    alert.summary_ms ??
    alert.warning_ms ??
    "Maklumat lanjut tidak tersedia.";

  if (
    getAlertType(
      alert.datatype
    ) !== "marine"
  ) {
    return originalText.trim();
  }

  const lines = originalText
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sabahLine =
    lines.find((line) =>
      line
        .toLowerCase()
        .includes("sabah")
    );

  if (!sabahLine) {
    return originalText.trim();
  }

  const lowerLine =
    sabahLine.toLowerCase();

  const sabahPosition =
    lowerLine.indexOf("sabah");

  const phrase =
    "dijangka di kawasan perairan";

  const phrasePosition =
    lowerLine.indexOf(phrase);

  if (
    sabahPosition !== -1 &&
    phrasePosition !== -1 &&
    sabahPosition >
      phrasePosition
  ) {
    const prefixEnd =
      phrasePosition +
      phrase.length;

    const prefix =
      sabahLine
        .slice(0, prefixEnd)
        .trim();

    const sabahSection =
      sabahLine
        .slice(sabahPosition)
        .trim();

    return `${prefix} ${sabahSection}`;
  }

  return sabahLine;
}

function isActive(
  alert: OfficialAlert
) {
  if (
    alert.alert_status !== "active"
  ) {
    return false;
  }

  if (!alert.valid_to) {
    return true;
  }

  const expiry =
    new Date(
      alert.valid_to
    ).getTime();

  return (
    !Number.isFinite(expiry) ||
    expiry >= Date.now()
  );
}

export default function AlertCenter() {
  const [data, setData] =
    useState<AlertsResponse | null>(
      null
    );

  const [filter, setFilter] =
    useState<AlertFilter>("all");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadAlerts = useCallback(
    async (
      manualRefresh = false
    ) => {
      try {
        if (manualRefresh) {
          setRefreshing(true);
        }

        setError("");

        const response = await fetch(
          "/api/alerts",
          {
            cache: "no-store"
          }
        );

        if (!response.ok) {
          throw new Error(
            "Alerts request failed"
          );
        }

        const result =
          (await response.json()) as
            AlertsResponse;

        if (
          result.status !== "success"
        ) {
          throw new Error(
            "Alerts API returned an error"
          );
        }

        setData(result);
      } catch (requestError) {
        console.error(
          "Alert Center error:",
          requestError
        );

        setError(
          "Amaran rasmi tidak dapat dimuatkan."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAlerts();

    const refreshTimer =
      window.setInterval(
        () => {
          loadAlerts();
        },
        5 * 60 * 1000
      );

    return () => {
      window.clearInterval(
        refreshTimer
      );
    };
  }, [loadAlerts]);

  const activeAlerts =
    useMemo(() => {
      return (
        data?.alerts ?? []
      ).filter(isActive);
    }, [data]);

  const filteredAlerts =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return activeAlerts.filter(
        (alert) => {
          const type =
            getAlertType(
              alert.datatype
            );

          const matchesFilter =
            filter === "all" ||
            type === filter;

          const searchableText = [
            getPublicTitle(alert),
            getPublicSummary(alert),
            alert.heading_ms
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !normalizedSearch ||
            searchableText.includes(
              normalizedSearch
            );

          return (
            matchesFilter &&
            matchesSearch
          );
        }
      );
    }, [
      activeAlerts,
      filter,
      search
    ]);

  return (
    <section className="panel tablePanel">
      <div className="panelHead">
        <div>
          <h2>
            Alert Center
          </h2>

          <p>
            Amaran rasmi aktif berkaitan
            Sabah daripada MetMalaysia
          </p>
        </div>

        <button
          type="button"
          disabled={refreshing}
          onClick={() => {
            loadAlerts(true);
          }}
        >
          {refreshing
            ? "Refreshing…"
            : "Refresh"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(180px, 1fr) minmax(190px, 240px)",
          gap: "10px",
          padding: "16px"
        }}
      >
        <input
          type="search"
          aria-label="Cari amaran"
          placeholder="Cari kawasan atau amaran…"
          value={search}
          onChange={(event) => {
            setSearch(
              event.target.value
            );
          }}
          style={{
            width: "100%",
            padding: "10px 12px",
            border:
              "1px solid rgba(148,163,184,0.25)",
            borderRadius: "8px",
            outline: "none",
            background: "#0f172a",
            color: "#f8fafc"
          }}
        />

        <select
          aria-label="Tapis amaran"
          value={filter}
          onChange={(event) => {
            setFilter(
              event.target
                .value as AlertFilter
            );
          }}
          style={{
            width: "100%",
            padding: "10px 12px",
            border:
              "1px solid rgba(148,163,184,0.25)",
            borderRadius: "8px",
            background: "#0f172a",
            color: "#f8fafc"
          }}
        >
          <option value="all">
            Semua amaran
          </option>

          <option value="marine">
            Amaran maritim
          </option>

          <option value="thunderstorm">
            Ribut petir
          </option>

          <option value="rain">
            Hujan berterusan
          </option>

          <option value="earthquake">
            Gempa bumi/tsunami
          </option>

          <option value="cyclone">
            Siklon tropika
          </option>
        </select>
      </div>

      {loading && (
        <div
          style={{
            padding: "22px"
          }}
        >
          Memuatkan amaran rasmi…
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            padding: "22px",
            color: "#f87171"
          }}
        >
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        filteredAlerts.length ===
          0 && (
          <div
            style={{
              padding: "28px 20px",
              textAlign: "center"
            }}
          >
            <b>
              Tiada amaran aktif
            </b>

            <p
              style={{
                marginBottom: 0,
                color: "#9fb0c5",
                fontSize: "12px"
              }}
            >
              Tiada amaran rasmi yang
              sepadan dengan carian atau
              penapis semasa.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        filteredAlerts.length >
          0 && (
          <div
            style={{
              display: "grid",
              gap: "12px",
              padding: "0 16px 16px"
            }}
          >
            {filteredAlerts.map(
              (alert) => {
                const color =
                  getAlertColor(
                    alert.datatype
                  );

                return (
                  <article
                    key={alert.id}
                    style={{
                      padding: "16px",
                      border:
                        `1px solid ${color}55`,
                      borderLeft:
                        `4px solid ${color}`,
                      borderRadius:
                        "9px",
                      background:
                        `${color}0d`
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        gap: "12px",
                        alignItems:
                          "flex-start",
                        justifyContent:
                          "space-between"
                      }}
                    >
                      <div>
                        <small
                          style={{
                            color,
                            fontWeight:
                              800,
                            letterSpacing:
                              "0.05em"
                          }}
                        >
                          AMARAN RASMI
                        </small>

                        <h3
                          style={{
                            margin:
                              "5px 0 0",
                            fontSize:
                              "16px"
                          }}
                        >
                          {getPublicTitle(
                            alert
                          )}
                        </h3>
                      </div>

                      <span
                        style={{
                          padding:
                            "5px 8px",
                          borderRadius:
                            "999px",
                          background:
                            `${color}22`,
                          color,
                          fontSize:
                            "10px",
                          fontWeight:
                            800,
                          whiteSpace:
                            "nowrap"
                        }}
                      >
                        AKTIF
                      </span>
                    </div>

                    <p
                      style={{
                        margin:
                          "14px 0",
                        color:
                          "#dbe7f5",
                        fontSize:
                          "13px",
                        lineHeight:
                          1.65,
                        whiteSpace:
                          "pre-line"
                      }}
                    >
                      {getPublicSummary(
                        alert
                      )}
                    </p>

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(3, minmax(0, 1fr))",
                        gap: "10px",
                        paddingTop:
                          "12px",
                        borderTop:
                          "1px solid rgba(148,163,184,0.15)"
                      }}
                    >
                      <small>
                        <b>
                          Bermula
                        </b>

                        <br />

                        {formatMalaysiaTime(
                          alert.valid_from
                        )}
                      </small>

                      <small>
                        <b>
                          Tamat
                        </b>

                        <br />

                        {formatMalaysiaTime(
                          alert.valid_to
                        )}
                      </small>

                      <small>
                        <b>
                          Sumber
                        </b>

                        <br />

                        {alert.source_name}
                      </small>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}

      {data && (
        <div
          style={{
            padding: "12px 16px",
            borderTop:
              "1px solid rgba(148,163,184,0.15)"
          }}
        >
          <small>
            {activeAlerts.length}
            {" amaran rasmi aktif · "}
            Semakan data:{" "}
            {formatMalaysiaTime(
              data.retrievedAt
            )}
            {" · "}
            Dikemas kini automatik setiap
            5 minit
          </small>
        </div>
      )}
    </section>
  );
}
