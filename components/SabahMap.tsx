"use client";

import {
  useEffect,
  useRef
} from "react";

import {
  SABAH_MET_LOCATIONS,
  type SabahMetLocation
} from "@/lib/metMalaysiaLocations";

type ForecastResult = {
  datatype: string;
  value: string | number | null;
};

type ForecastResponse = {
  status: string;
  source: string;
  retrievedAt: string;

  data?: {
    results?: ForecastResult[];
  };
};

type OfficialAlert = {
  id: string;
  source_name: string;
  datatype: string;
  heading_ms: string | null;
  summary_ms: string | null;
  warning_ms: string | null;
  valid_from: string | null;
  valid_to: string | null;
};

type AlertsResponse = {
  status: string;
  alerts?: OfficialAlert[];
};

type RiskRow = {
  id?: string;
  district?: string;
  hazard_type?: string;
  overall_score?: number | string;
  risk_level?: string;
  confidence_score?: number | string;
  data_status?: string;
};

const SABAH_CENTER: [
  number,
  number
] = [
  5.55,
  117.25
];

const riskColors: Record<
  string,
  string
> = {
  LOW: "#72bc8f",
  MODERATE: "#eac26b",
  MEDIUM: "#eac26b",
  HIGH: "#de9255",
  CRITICAL: "#e97366",
  EXTREME: "#dc2626"
};

function escapeHtml(
  value: unknown
) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeText(
  value: string | null | undefined
) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatMalaysiaTime(
  timestamp: string | null | undefined
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

function getForecastValue(
  results: ForecastResult[],
  datatype: string
) {
  const result = results.find(
    (item) =>
      item.datatype === datatype
  );

  if (
    result?.value === null ||
    result?.value === undefined
  ) {
    return "—";
  }

  return String(result.value);
}

function buildForecastPopup(
  location: SabahMetLocation,
  response: ForecastResponse
) {
  const results =
    response.data?.results ?? [];

  if (results.length === 0) {
    return `
      <div style="min-width:220px">
        <b>${escapeHtml(location.name)}</b>
        <br>
        <small>
          ${escapeHtml(location.id)}
        </small>
        <hr style="border:0;border-top:1px solid #ddd;margin:8px 0">
        <b>Ramalan belum tersedia</b>
        <br>
        <small>
          MetMalaysia tidak memulangkan ramalan GENERAL untuk lokasi ini pada tarikh semasa.
        </small>
        <br><br>
        <small>
          Sumber: MetMalaysia via SDIP Supabase
        </small>
      </div>
    `;
  }

  const significant =
    getForecastValue(
      results,
      "FSIGW"
    );

  const morning =
    getForecastValue(
      results,
      "FGM"
    );

  const afternoon =
    getForecastValue(
      results,
      "FGA"
    );

  const night =
    getForecastValue(
      results,
      "FGN"
    );

  const minimum =
    getForecastValue(
      results,
      "FMINT"
    );

  const maximum =
    getForecastValue(
      results,
      "FMAXT"
    );

  return `
    <div style="min-width:240px">
      <b>${escapeHtml(location.name)}</b>
      <br>
      <small>
        ${escapeHtml(location.id)} · OFFICIAL FORECAST
      </small>

      <hr style="border:0;border-top:1px solid #ddd;margin:8px 0">

      <b>${escapeHtml(significant)}</b>

      <table style="width:100%;margin-top:8px;font-size:12px">
        <tr>
          <td>Pagi</td>
          <td style="text-align:right">
            <b>${escapeHtml(morning)}</b>
          </td>
        </tr>

        <tr>
          <td>Petang</td>
          <td style="text-align:right">
            <b>${escapeHtml(afternoon)}</b>
          </td>
        </tr>

        <tr>
          <td>Malam</td>
          <td style="text-align:right">
            <b>${escapeHtml(night)}</b>
          </td>
        </tr>

        <tr>
          <td>Suhu</td>
          <td style="text-align:right">
            <b>
              ${escapeHtml(minimum)}°C–${escapeHtml(maximum)}°C
            </b>
          </td>
        </tr>
      </table>

      <hr style="border:0;border-top:1px solid #ddd;margin:8px 0">

      <small>
        Sumber asal: MetMalaysia
        <br>
        Data disimpan: ${escapeHtml(
          formatMalaysiaTime(
            response.retrievedAt
          )
        )}
      </small>
    </div>
  `;
}

function extractRiskRows(
  payload: unknown
): RiskRow[] {
  const source =
    payload as Record<
      string,
      unknown
    >;

  const candidates = [
    source.data,
    source.risks,
    source.results,
    (
      source.data as
        | Record<string, unknown>
        | undefined
    )?.rows
  ];

  const rows =
    candidates.find(
      Array.isArray
    );

  return Array.isArray(rows)
    ? (rows as RiskRow[])
    : [];
}

function getRiskColor(
  level: string
) {
  return (
    riskColors[
      level.toUpperCase()
    ] ?? "#eac26b"
  );
}

export default function SabahMap() {
  const node =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any;
    let cancelled = false;

    const forecastPopupCache =
      new Map<string, string>();

    async function initializeMap() {
      if (!node.current) {
        return;
      }

      const L =
        await import("leaflet");

      if (
        cancelled ||
        !node.current
      ) {
        return;
      }

      node.current.innerHTML = "";

      map = L.map(
        node.current,
        {
          minZoom: 6,
          maxZoom: 14,
          zoomControl: true
        }
      ).setView(
        SABAH_CENTER,
        7
      );

      const tiles =
        process.env
          .NEXT_PUBLIC_MAP_TILE_URL ||
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      L.tileLayer(
        tiles,
        {
          maxZoom: 19,
          attribution:
            "© OpenStreetMap contributors"
        }
      ).addTo(map);

      map.createPane(
        "riskPane"
      );

      map.getPane(
        "riskPane"
      ).style.zIndex = "410";

      map.createPane(
        "warningPane"
      );

      map.getPane(
        "warningPane"
      ).style.zIndex = "420";

      const locationLayer =
        L.layerGroup().addTo(map);

      const warningLayer =
        L.layerGroup().addTo(map);

      const riskLayer =
        L.layerGroup().addTo(map);

      /*
       * Lokasi forecast rasmi.
       * Data forecast hanya dimuatkan
       * apabila marker diklik.
       */
      SABAH_MET_LOCATIONS.forEach(
        (location) => {
          if (
            location.latitude === null ||
            location.longitude === null
          ) {
            return;
          }

          const marker =
            L.circleMarker(
              [
                location.latitude,
                location.longitude
              ],
              {
                radius: 6,
                color: "#ffffff",
                weight: 2,
                fillColor: "#38bdf8",
                fillOpacity: 0.95
              }
            ).addTo(
              locationLayer
            );

          marker.bindTooltip(
            escapeHtml(
              location.name
            ),
            {
              direction: "top",
              offset: [0, -5]
            }
          );

          marker.bindPopup(`
            <div style="min-width:200px">
              <b>${escapeHtml(location.name)}</b>
              <br>
              <small>
                ${escapeHtml(location.id)} · METMALAYSIA
              </small>
              <br><br>
              Memuatkan ramalan rasmi…
            </div>
          `);

          marker.on(
            "click",
            async () => {
              const cachedPopup =
                forecastPopupCache.get(
                  location.id
                );

              if (cachedPopup) {
                marker
                  .setPopupContent(
                    cachedPopup
                  )
                  .openPopup();

                return;
              }

              marker
                .setPopupContent(`
                  <div style="min-width:200px">
                    <b>${escapeHtml(location.name)}</b>
                    <br><br>
                    Memuatkan ramalan rasmi…
                  </div>
                `)
                .openPopup();

              try {
                const params =
                  new URLSearchParams({
                    locationid:
                      location.id
                  });

                const response =
                  await fetch(
                    `/api/forecast?${params.toString()}`,
                    {
                      cache:
                        "no-store"
                    }
                  );

                if (!response.ok) {
                  throw new Error(
                    "Forecast request failed"
                  );
                }

                const data =
                  (await response.json()) as
                    ForecastResponse;

                const popupContent =
                  buildForecastPopup(
                    location,
                    data
                  );

                forecastPopupCache.set(
                  location.id,
                  popupContent
                );

                marker
                  .setPopupContent(
                    popupContent
                  )
                  .openPopup();
              } catch (error) {
                console.error(
                  "Map forecast error:",
                  error
                );

                marker
                  .setPopupContent(`
                    <div style="min-width:210px">
                      <b>${escapeHtml(location.name)}</b>
                      <br><br>
                      Data ramalan tidak dapat dimuatkan.
                      <br>
                      <small>
                        Sila cuba semula kemudian.
                      </small>
                    </div>
                  `)
                  .openPopup();
              }
            }
          );
        }
      );

      /*
       * Ambil amaran rasmi dan
       * risiko simulasi secara selari.
       */
      const [
        alertsResult,
        risksResult
      ] = await Promise.allSettled([
        fetch(
          "/api/alerts",
          {
            cache: "no-store"
          }
        ).then(
          async (response) => {
            if (!response.ok) {
              throw new Error(
                "Alerts request failed"
              );
            }

            return (
              await response.json()
            ) as AlertsResponse;
          }
        ),

        fetch(
          "/api/risk",
          {
            cache: "no-store"
          }
        ).then(
          async (response) => {
            if (!response.ok) {
              throw new Error(
                "Risk request failed"
              );
            }

            return response.json();
          }
        )
      ]);

      if (
        cancelled ||
        !map
      ) {
        return;
      }

      /*
       * Padankan nama lokasi Sabah
       * dengan teks amaran rasmi.
       */
      if (
        alertsResult.status ===
        "fulfilled"
      ) {
        const alerts =
          alertsResult.value
            .alerts ?? [];

        SABAH_MET_LOCATIONS.forEach(
          (location) => {
            if (
              location.latitude ===
                null ||
              location.longitude ===
                null
            ) {
              return;
            }

            const locationName =
              normalizeText(
                location.name
              );

            const matchedAlerts =
              alerts.filter(
                (alert) => {
                  const alertText =
                    normalizeText(
                      [
                        alert.heading_ms,
                        alert.summary_ms,
                        alert.warning_ms
                      ].join(" ")
                    );

                  return alertText.includes(
                    locationName
                  );
                }
              );

            if (
              matchedAlerts.length === 0
            ) {
              return;
            }

            const alertList =
              matchedAlerts
                .map(
                  (alert) => `
                    <div style="margin-top:9px">
                      <b>
                        ${escapeHtml(
                          alert.heading_ms ??
                            "Amaran MetMalaysia"
                        )}
                      </b>
                      <br>
                      <small>
                        ${escapeHtml(
                          alert.summary_ms ??
                            alert.warning_ms ??
                            ""
                        )}
                      </small>
                      <br>
                      <small>
                        Sah hingga:
                        ${escapeHtml(
                          formatMalaysiaTime(
                            alert.valid_to
                          )
                        )}
                      </small>
                    </div>
                  `
                )
                .join("");

            L.circle(
              [
                location.latitude,
                location.longitude
              ],
              {
                pane:
                  "warningPane",
                radius: 18000,
                color: "#ef4444",
                weight: 2,
                fillColor:
                  "#ef4444",
                fillOpacity: 0.2
              }
            )
              .addTo(
                warningLayer
              )
              .bindPopup(`
                <div style="min-width:260px">
                  <b>
                    ${escapeHtml(location.name)}
                  </b>
                  <br>
                  <small>
                    OFFICIAL ALERT · METMALAYSIA
                  </small>

                  ${alertList}
                </div>
              `);
          }
        );
      }

      /*
       * Risiko daripada Supabase.
       * Kekal berlabel SIMULATED.
       */
      if (
        risksResult.status ===
        "fulfilled"
      ) {
        const riskRows =
          extractRiskRows(
            risksResult.value
          );

        riskRows.forEach(
          (risk) => {
            const district =
              risk.district ?? "";

            const location =
              SABAH_MET_LOCATIONS.find(
                (item) =>
                  normalizeText(
                    item.name
                  ) ===
                  normalizeText(
                    district
                  )
              );

            if (
              !location ||
              location.latitude ===
                null ||
              location.longitude ===
                null
            ) {
              return;
            }

            const riskLevel =
              (
                risk.risk_level ??
                "MODERATE"
              ).toUpperCase();

            const color =
              getRiskColor(
                riskLevel
              );

            const score =
              Number(
                risk.overall_score ??
                  0
              );

            const confidence =
              Number(
                risk.confidence_score ??
                  0
              );

            const radius =
              Math.max(
                14000,
                Math.min(
                  40000,
                  score * 400
                )
              );

            L.circle(
              [
                location.latitude,
                location.longitude
              ],
              {
                pane: "riskPane",
                radius,
                color,
                weight: 2,
                fillColor: color,
                fillOpacity: 0.2
              }
            )
              .addTo(riskLayer)
              .bindPopup(`
                <div style="min-width:220px">
                  <b>
                    ${escapeHtml(district)}
                  </b>
                  <br>
                  <small>
                    SIMULATED RISK ASSESSMENT
                  </small>

                  <hr style="border:0;border-top:1px solid #ddd;margin:8px 0">

                  Hazard:
                  <b>
                    ${escapeHtml(
                      risk.hazard_type ??
                        "Unknown"
                    )}
                  </b>
                  <br>

                  Risk level:
                  <b>
                    ${escapeHtml(
                      riskLevel
                    )}
                  </b>
                  <br>

                  Score:
                  <b>
                    ${escapeHtml(
                      Number.isFinite(
                        score
                      )
                        ? score.toFixed(1)
                        : "—"
                    )}
                  </b>
                  <br>

                  Confidence:
                  <b>
                    ${escapeHtml(
                      Number.isFinite(
                        confidence
                      )
                        ? `${confidence}%`
                        : "—"
                    )}
                  </b>

                  <hr style="border:0;border-top:1px solid #ddd;margin:8px 0">

                  <small>
                    Sumber: SDIP Supabase
                    <br>
                    Status:
                    ${escapeHtml(
                      risk.data_status ??
                        "simulated"
                    )}
                    <br>
                    Bukan amaran rasmi.
                  </small>
                </div>
              `);
          }
        );
      }

      L.control.layers(
        {},
        {
          "Official forecast locations":
            locationLayer,

          "Active official warnings":
            warningLayer,

          "Simulated risk assessments":
            riskLayer
        },
        {
          collapsed: false,
          position: "topright"
        }
      ).addTo(map);
    }

    initializeMap().catch(
      (error) => {
        console.error(
          "Sabah map initialization error:",
          error
        );
      }
    );

    return () => {
      cancelled = true;

      if (map) {
        map.remove();
      }
    };
  }, []);

  return (
    <div className="mapShell">
      <div
        ref={node}
        className="mapCanvas"
      />

      <div className="mapBadge">
        OFFICIAL + SIMULATED LAYERS
      </div>

      <div className="legend">
        <span>
          <i
            style={{
              background:
                "#38bdf8"
            }}
          />
          Official forecast
        </span>

        <span>
          <i
            style={{
              background:
                "#ef4444"
            }}
          />
          Official warning
        </span>

        <span>
          <i
            style={{
              background:
                "#de9255"
            }}
          />
          Simulated risk
        </span>
      </div>
    </div>
  );
}
