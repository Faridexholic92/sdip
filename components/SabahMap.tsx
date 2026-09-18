"use client";

import {
  useEffect,
  useRef
} from "react";

import {
  SABAH_MET_LOCATIONS
} from "@/lib/metMalaysiaLocations";

type DistrictForecast = {
  available: boolean;
  date: string;
  morning: string | null;
  afternoon: string | null;
  night: string | null;
  significantWeather: string | null;
  minimumTemperature: number | null;
  maximumTemperature: number | null;
  lastUpdated: string | null;
  source: string | null;
};

type DistrictItem = {
  locationId: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  forecast: DistrictForecast;
};

type DistrictResponse = {
  status: string;
  date: string;
  districts: DistrictItem[];
  retrievedAt: string;
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
  alerts: OfficialAlert[];
  retrievedAt: string;
};

const SABAH_CENTER: [
  number,
  number
] = [
  5.55,
  117.25
];

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

function shortenText(
  value: string,
  maximumLength = 550
) {
  const cleaned = value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (
    cleaned.length <= maximumLength
  ) {
    return cleaned;
  }

  return `${cleaned.slice(
    0,
    maximumLength
  )}…`;
}

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

function getPublicAlertTitle(
  datatype: string
) {
  const normalized =
    datatype.toUpperCase();

  if (
    normalized === "WINDSEA" ||
    normalized === "WINDSEA2"
  ) {
    return "AMARAN MARITIM RASMI METMALAYSIA";
  }

  if (
    normalized === "THUNDERSTORM" ||
    normalized === "THUNDERSTORM2"
  ) {
    return "AMARAN RIBUT PETIR RASMI METMALAYSIA";
  }

  if (
    normalized === "RAIN" ||
    normalized === "RAIN2"
  ) {
    return "AMARAN HUJAN BERTERUSAN RASMI METMALAYSIA";
  }

  if (
    normalized === "QUAKETSUNAMI" ||
    normalized === "QUAKETSUNAMI2"
  ) {
    return "MAKLUMAN GEMPA BUMI DAN TSUNAMI RASMI METMALAYSIA";
  }

  if (
    normalized === "CYCLONE" ||
    normalized === "CYCLONE2"
  ) {
    return "AMARAN SIKLON TROPIKA RASMI METMALAYSIA";
  }

  return "AMARAN RASMI METMALAYSIA";
}

function getPublicAlertSummary(
  alert: OfficialAlert
) {
  const originalText =
    alert.summary_ms ??
    alert.warning_ms ??
    "Maklumat lanjut tidak tersedia.";

  const datatype =
    alert.datatype.toUpperCase();

  const isMarine =
    datatype === "WINDSEA" ||
    datatype === "WINDSEA2";

  if (!isMarine) {
    return shortenText(
      originalText
    );
  }

  /*
   * Bulletin maritim MetMalaysia boleh
   * mengandungi senarai seluruh Malaysia.
   *
   * Untuk paparan Sabah, kita ambil ayat
   * rasmi yang mengandungi perkataan Sabah
   * dan buang senarai negeri sebelumnya.
   */
  const lines = originalText
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sabahLine = lines.find(
    (line) =>
      line
        .toLowerCase()
        .includes("sabah")
  );

  if (!sabahLine) {
    return shortenText(
      originalText
    );
  }

  const lowerLine =
    sabahLine.toLowerCase();

  const sabahPosition =
    lowerLine.indexOf("sabah");

  const locationPhrase =
    "dijangka di kawasan perairan";

  const locationPhrasePosition =
    lowerLine.indexOf(
      locationPhrase
    );

  if (
    sabahPosition !== -1 &&
    locationPhrasePosition !== -1 &&
    sabahPosition >
      locationPhrasePosition
  ) {
    const prefixEnd =
      locationPhrasePosition +
      locationPhrase.length;

    const prefix =
      sabahLine
        .slice(0, prefixEnd)
        .trim();

    const sabahSection =
      sabahLine
        .slice(sabahPosition)
        .trim();

    return shortenText(
      `${prefix} ${sabahSection}`
    );
  }

  return shortenText(
    sabahLine
  );
}

function getForecastColor(
  forecast: DistrictForecast
) {
  if (!forecast.available) {
    return "#94a3b8";
  }

  const weather =
    forecast.significantWeather
      ?.toLowerCase() ?? "";

  if (
    weather.includes(
      "ribut petir"
    )
  ) {
    return "#f59e0b";
  }

  if (
    weather.includes("hujan")
  ) {
    return "#38bdf8";
  }

  if (
    weather.includes(
      "tiada hujan"
    )
  ) {
    return "#22c55e";
  }

  return "#38bdf8";
}

function buildForecastDetails(
  district: DistrictItem
) {
  const forecast =
    district.forecast;

  if (!forecast.available) {
    return `
      <b>Ramalan belum tersedia</b>

      <br>

      <small>
        MetMalaysia tidak memulangkan ramalan GENERAL bagi lokasi ini pada tarikh semasa.
      </small>
    `;
  }

  return `
    <b>
      ${escapeHtml(
        forecast.significantWeather ??
          "Tiada cuaca signifikan dinyatakan"
      )}
    </b>

    <table style="width:100%;margin-top:8px;font-size:12px">
      <tr>
        <td>Pagi</td>

        <td style="text-align:right">
          <b>
            ${escapeHtml(
              forecast.morning ?? "—"
            )}
          </b>
        </td>
      </tr>

      <tr>
        <td>Petang</td>

        <td style="text-align:right">
          <b>
            ${escapeHtml(
              forecast.afternoon ?? "—"
            )}
          </b>
        </td>
      </tr>

      <tr>
        <td>Malam</td>

        <td style="text-align:right">
          <b>
            ${escapeHtml(
              forecast.night ?? "—"
            )}
          </b>
        </td>
      </tr>

      <tr>
        <td>Suhu</td>

        <td style="text-align:right">
          <b>
            ${escapeHtml(
              forecast.minimumTemperature ??
                "—"
            )}°C–${escapeHtml(
              forecast.maximumTemperature ??
                "—"
            )}°C
          </b>
        </td>
      </tr>
    </table>

    <small>
      Dikemas kini:
      ${escapeHtml(
        formatMalaysiaTime(
          forecast.lastUpdated
        )
      )}
    </small>
  `;
}

function buildForecastPopup(
  district: DistrictItem
) {
  return `
    <div style="min-width:250px">
      <b>
        ${escapeHtml(
          district.district
        )}
      </b>

      <br>

      <small>
        RAMALAN CUACA RASMI METMALAYSIA
      </small>

      <hr style="border:0;border-top:1px solid #ddd;margin:8px 0">

      ${buildForecastDetails(
        district
      )}

      <hr style="border:0;border-top:1px solid #ddd;margin:8px 0">

      <small>
        Sumber asal: MetMalaysia

        <br>

        Lokasi:
        ${escapeHtml(
          district.locationId
        )}

        <br>

        Saluran data: SDIP Supabase
      </small>
    </div>
  `;
}

function buildAlertPopup(
  district: DistrictItem,
  alerts: OfficialAlert[]
) {
  const alertContent = alerts
    .map((alert) => {
      const publicTitle =
        getPublicAlertTitle(
          alert.datatype
        );

      const publicSummary =
        getPublicAlertSummary(
          alert
        );

      return `
        <div style="margin-top:10px">
          <b>
            ${escapeHtml(
              publicTitle
            )}
          </b>

          <br>

          <small>
            AMARAN AKTIF · SUMBER RASMI
          </small>

          <p style="font-size:12px;line-height:1.5;white-space:pre-line;margin:8px 0">
            ${escapeHtml(
              publicSummary
            )}
          </p>

          <small>
            Sah dari:
            ${escapeHtml(
              formatMalaysiaTime(
                alert.valid_from
              )
            )}

            <br>

            Sah hingga:
            ${escapeHtml(
              formatMalaysiaTime(
                alert.valid_to
              )
            )}

            <br>

            Sumber:
            ${escapeHtml(
              alert.source_name
            )}
          </small>
        </div>
      `;
    })
    .join(`
      <hr style="border:0;border-top:1px solid #ddd;margin:10px 0">
    `);

  return `
    <div style="min-width:280px;max-width:370px">
      <b>
        ${escapeHtml(
          district.district
        )}
      </b>

      <br>

      <small>
        KAWASAN AMARAN RASMI
      </small>

      ${alertContent}

      <hr style="border:0;border-top:1px solid #ddd;margin:10px 0">

      <small>
        Ramalan cuaca lokasi
      </small>

      <div style="margin-top:6px">
        ${buildForecastDetails(
          district
        )}
      </div>
    </div>
  `;
}

function buildGeneralAlertPopup(
  alerts: OfficialAlert[]
) {
  const onlyMarineAlerts =
    alerts.length > 0 &&
    alerts.every((alert) => {
      const datatype =
        alert.datatype.toUpperCase();

      return (
        datatype === "WINDSEA" ||
        datatype === "WINDSEA2"
      );
    });

  const popupTitle =
    onlyMarineAlerts
      ? "AMARAN MARITIM RASMI METMALAYSIA"
      : "AMARAN RASMI METMALAYSIA";

  const content = alerts
    .map((alert) => {
      const publicTitle =
        getPublicAlertTitle(
          alert.datatype
        );

      const publicSummary =
        getPublicAlertSummary(
          alert
        );

      return `
        <div style="margin-top:10px">
          ${
            alerts.length > 1
              ? `
                <b>
                  ${escapeHtml(
                    publicTitle
                  )}
                </b>

                <br>
              `
              : ""
          }

          <small>
            AMARAN AKTIF · SUMBER RASMI
          </small>

          <p style="font-size:12px;line-height:1.5;white-space:pre-line;margin:8px 0">
            ${escapeHtml(
              publicSummary
            )}
          </p>

          <small>
            Sah dari:
            ${escapeHtml(
              formatMalaysiaTime(
                alert.valid_from
              )
            )}

            <br>

            Sah hingga:
            ${escapeHtml(
              formatMalaysiaTime(
                alert.valid_to
              )
            )}

            <br>

            Sumber:
            ${escapeHtml(
              alert.source_name
            )}
          </small>
        </div>
      `;
    })
    .join(`
      <hr style="border:0;border-top:1px solid #ddd;margin:10px 0">
    `);

  return `
    <div style="min-width:290px;max-width:380px">
      <b>
        ${escapeHtml(
          popupTitle
        )}
      </b>

      <br>

      <small>
        PERAIRAN SABAH · MARKER RUJUKAN, BUKAN LOKASI KEJADIAN TEPAT
      </small>

      ${content}
    </div>
  `;
}

function createFallbackDistricts():
  DistrictItem[] {
  return SABAH_MET_LOCATIONS.map(
    (location) => ({
      locationId: location.id,
      district: location.name,
      latitude: location.latitude,
      longitude: location.longitude,

      forecast: {
        available: false,
        date: "",
        morning: null,
        afternoon: null,
        night: null,
        significantWeather: null,
        minimumTemperature: null,
        maximumTemperature: null,
        lastUpdated: null,
        source: null
      }
    })
  );
}

function isAlertActive(
  alert: OfficialAlert
) {
  if (!alert.valid_to) {
    return true;
  }

  const validTo =
    new Date(
      alert.valid_to
    ).getTime();

  if (!Number.isFinite(validTo)) {
    return true;
  }

  return validTo >= Date.now();
}

export default function SabahMap() {
  const node =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any;
    let cancelled = false;

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
          maxZoom: 18,
          zoomControl: true
        }
      ).setView(
        SABAH_CENTER,
        7
      );

      const esriImageryTiles =
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,

            attribution:
              "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
          }
        );

      const esriPlaceLabels =
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            attribution:
              "Labels © Esri"
          }
        );

      const esriSatellite =
        L.layerGroup([
          esriImageryTiles,
          esriPlaceLabels
        ]);

      const esriTopographic =
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            attribution:
              "Tiles © Esri"
          }
        );

      const openStreetMap =
        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              "© OpenStreetMap contributors"
          }
        );

      esriSatellite.addTo(map);

      map.createPane(
        "warningAreaPane"
      );

      map.getPane(
        "warningAreaPane"
      ).style.zIndex = "430";

      map.createPane(
        "warningMarkerPane"
      );

      map.getPane(
        "warningMarkerPane"
      ).style.zIndex = "650";

      const forecastLayer =
        L.layerGroup().addTo(map);

      const warningLayer =
        L.layerGroup().addTo(map);

      const [
        districtRequest,
        alertRequest
      ] = await Promise.allSettled([
        fetch(
          "/api/districts",
          {
            cache: "no-store"
          }
        ).then(
          async (response) => {
            if (!response.ok) {
              throw new Error(
                "District request failed"
              );
            }

            return (
              await response.json()
            ) as DistrictResponse;
          }
        ),

        fetch(
          "/api/alerts",
          {
            cache: "no-store"
          }
        ).then(
          async (response) => {
            if (!response.ok) {
              throw new Error(
                "Alert request failed"
              );
            }

            return (
              await response.json()
            ) as AlertsResponse;
          }
        )
      ]);

      if (
        cancelled ||
        !map
      ) {
        return;
      }

      const districts =
        districtRequest.status ===
          "fulfilled" &&
        districtRequest.value.status ===
          "success"
          ? districtRequest.value
              .districts
          : createFallbackDistricts();

      const alerts =
        alertRequest.status ===
          "fulfilled" &&
        alertRequest.value.status ===
          "success"
          ? (
              alertRequest.value
                .alerts ?? []
            ).filter(
              isAlertActive
            )
          : [];

      districts.forEach(
        (district) => {
          if (
            district.latitude === null ||
            district.longitude === null
          ) {
            return;
          }

          const marker =
            L.circleMarker(
              [
                district.latitude,
                district.longitude
              ],
              {
                radius: 7,
                color: "#ffffff",
                weight: 2,

                fillColor:
                  getForecastColor(
                    district.forecast
                  ),

                fillOpacity: 0.95,
                interactive: true,
                bubblingMouseEvents: false
              }
            );

          marker.bindTooltip(
            escapeHtml(
              district.district
            ),
            {
              direction: "top",
              offset: [0, -6]
            }
          );

          marker.bindPopup(
            buildForecastPopup(
              district
            )
          );

          marker.addTo(
            forecastLayer
          );
        }
      );

      const matchedAlertIds =
        new Set<string>();

      districts.forEach(
        (district) => {
          if (
            district.latitude === null ||
            district.longitude === null
          ) {
            return;
          }

          const districtName =
            normalizeText(
              district.district
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
                  districtName
                );
              }
            );

          if (
            matchedAlerts.length === 0
          ) {
            return;
          }

          matchedAlerts.forEach(
            (alert) => {
              matchedAlertIds.add(
                alert.id
              );
            }
          );

          L.circle(
            [
              district.latitude,
              district.longitude
            ],
            {
              pane:
                "warningAreaPane",
              radius: 18000,
              color: "#ef4444",
              weight: 2,
              fillColor: "#ef4444",
              fillOpacity: 0.14,
              interactive: false
            }
          ).addTo(
            warningLayer
          );

          const pulseIcon =
            L.divIcon({
              className:
                "sdipPulseIcon",

              html: `
                <span class="sdipPulse">
                  <span class="sdipPulseRing"></span>
                  <span class="sdipPulseRing sdipPulseRingDelay"></span>
                  <span class="sdipPulseCore"></span>
                </span>
              `,

              iconSize: [
                38,
                38
              ],

              iconAnchor: [
                19,
                19
              ],

              popupAnchor: [
                0,
                -18
              ]
            });

          L.marker(
            [
              district.latitude,
              district.longitude
            ],
            {
              pane:
                "warningMarkerPane",

              icon:
                pulseIcon,

              keyboard: true,
              interactive: true,
              bubblingMouseEvents: false,

              title:
                `Amaran aktif: ${district.district}`
            }
          )
            .addTo(
              warningLayer
            )
            .bindTooltip(
              `Amaran rasmi · ${escapeHtml(
                district.district
              )}`,
              {
                direction: "top",
                offset: [0, -18]
              }
            )
            .bindPopup(
              buildAlertPopup(
                district,
                matchedAlerts
              )
            );
        }
      );

      const generalAlerts =
        alerts.filter(
          (alert) =>
            !matchedAlertIds.has(
              alert.id
            )
        );

      if (
        generalAlerts.length > 0
      ) {
        const generalPulseIcon =
          L.divIcon({
            className:
              "sdipPulseIcon",

            html: `
              <span class="sdipPulse sdipPulseGeneral">
                <span class="sdipPulseRing"></span>
                <span class="sdipPulseRing sdipPulseRingDelay"></span>
                <span class="sdipPulseCore"></span>
              </span>
            `,

            iconSize: [
              42,
              42
            ],

            iconAnchor: [
              21,
              21
            ],

            popupAnchor: [
              0,
              -20
            ]
          });

        L.marker(
          SABAH_CENTER,
          {
            pane:
              "warningMarkerPane",

            icon:
              generalPulseIcon,

            keyboard: true,
            interactive: true,
            bubblingMouseEvents: false,

            title:
              "Amaran rasmi MetMalaysia"
          }
        )
          .addTo(
            warningLayer
          )
          .bindTooltip(
            "Amaran rasmi MetMalaysia · marker rujukan",
            {
              direction: "top",
              offset: [0, -20]
            }
          )
          .bindPopup(
            buildGeneralAlertPopup(
              generalAlerts
            )
          );
      }

      L.control.layers(
        {
          "Esri Satellite":
            esriSatellite,

          "Esri Topographic":
            esriTopographic,

          "OpenStreetMap":
            openStreetMap
        },
        {
          "Ramalan rasmi":
            forecastLayer,

          "Amaran rasmi aktif":
            warningLayer
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
        DATA RASMI METMALAYSIA
      </div>

      <div className="legend">
        <span>
          <i
            style={{
              background:
                "#22c55e"
            }}
          />

          Tiada hujan
        </span>

        <span>
          <i
            style={{
              background:
                "#38bdf8"
            }}
          />

          Hujan
        </span>

        <span>
          <i
            style={{
              background:
                "#f59e0b"
            }}
          />

          Ribut petir
        </span>

        <span>
          <i
            className="sdipLegendPulse"
          />

          Amaran rasmi
        </span>
      </div>

      <style jsx global>{`
        .sdipPulseIcon {
          background: transparent !important;
          border: 0 !important;
          pointer-events: auto !important;
          cursor: pointer !important;
        }

        .sdipPulse {
          position: relative;
          display: block;
          width: 38px;
          height: 38px;
          pointer-events: none;
        }

        .sdipPulseGeneral {
          width: 42px;
          height: 42px;
        }

        .sdipPulseRing {
          position: absolute;
          inset: 0;
          border: 3px solid
            rgba(239, 68, 68, 0.9);
          border-radius: 50%;
          pointer-events: none;

          animation:
            sdipOfficialAlertPulse
            1.8s ease-out infinite;
        }

        .sdipPulseRingDelay {
          animation-delay: 0.9s;
        }

        .sdipPulseCore {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 14px;
          height: 14px;
          border: 3px solid #ffffff;
          border-radius: 50%;
          background: #ef4444;

          box-shadow:
            0 0 0 3px
              rgba(239, 68, 68, 0.3),
            0 0 18px
              rgba(239, 68, 68, 0.95);

          pointer-events: none;

          transform:
            translate(-50%, -50%);
        }

        .sdipLegendPulse {
          display: inline-block;
          width: 10px !important;
          height: 10px !important;
          border-radius: 50%;
          background:
            #ef4444 !important;

          box-shadow:
            0 0 0 4px
              rgba(239, 68, 68, 0.22);
        }

        @keyframes
          sdipOfficialAlertPulse {
          0% {
            opacity: 1;
            transform:
              scale(0.35);
          }

          70% {
            opacity: 0.25;
          }

          100% {
            opacity: 0;
            transform:
              scale(1.35);
          }
        }

        @media (
          prefers-reduced-motion:
          reduce
        ) {
          .sdipPulseRing {
            animation: none;
            opacity: 0.45;
          }
        }
      `}</style>
    </div>
  );
}
