"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

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

type DistrictRisk = {
  id: string;
  hazardType: string;
  overallScore: number | null;
  riskLevel: string;
  confidenceScore: number | null;
  dataStatus: string;
  source: string;
};

type DistrictItem = {
  locationId: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  forecast: DistrictForecast;
  risks: DistrictRisk[];
};

type DistrictResponse = {
  status: string;
  source: string;
  date: string;

  summary: {
    totalDistrictLocations: number;
    forecastAvailable: number;
    forecastUnavailable: number;
    districtsWithRisk: number;
  };

  districts: DistrictItem[];
  retrievedAt: string;
};

type FilterValue =
  | "all"
  | "forecast"
  | "unavailable"
  | "risk";

function formatMalaysiaTime(
  timestamp: string | null
) {
  if (!timestamp) {
    return "—";
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

function getWeatherColor(
  weather: string | null
) {
  const normalized =
    weather?.toLowerCase() ?? "";

  if (
    normalized.includes(
      "ribut petir"
    )
  ) {
    return "#ef4444";
  }

  if (
    normalized.includes("hujan")
  ) {
    return "#38bdf8";
  }

  if (
    normalized.includes(
      "tiada hujan"
    )
  ) {
    return "#22c55e";
  }

  return "#94a3b8";
}

function getRiskColor(
  riskLevel: string
) {
  const normalized =
    riskLevel.toUpperCase();

  if (
    normalized === "CRITICAL" ||
    normalized === "EXTREME"
  ) {
    return "#dc2626";
  }

  if (normalized === "HIGH") {
    return "#f97316";
  }

  if (
    normalized === "MODERATE" ||
    normalized === "MEDIUM"
  ) {
    return "#eab308";
  }

  return "#22c55e";
}

export default function DistrictMonitoring() {
  const [data, setData] =
    useState<DistrictResponse | null>(
      null
    );

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<FilterValue>("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDistricts = useCallback(
    async () => {
      try {
        setError("");

        const response = await fetch(
          "/api/districts",
          {
            cache: "no-store"
          }
        );

        if (!response.ok) {
          throw new Error(
            "District request failed"
          );
        }

        const result =
          (await response.json()) as
            DistrictResponse;

        if (
          result.status !== "success"
        ) {
          throw new Error(
            "District API returned an error"
          );
        }

        setData(result);
      } catch (requestError) {
        console.error(
          "District monitoring error:",
          requestError
        );

        setError(
          "Data pemantauan daerah tidak dapat dimuatkan."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDistricts();

    const refreshTimer =
      window.setInterval(
        loadDistricts,
        5 * 60 * 1000
      );

    return () => {
      window.clearInterval(
        refreshTimer
      );
    };
  }, [loadDistricts]);

  const filteredDistricts =
    useMemo(() => {
      const districts =
        data?.districts ?? [];

      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return districts.filter(
        (district) => {
          const matchesSearch =
            !normalizedSearch ||
            district.district
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          if (!matchesSearch) {
            return false;
          }

          if (
            filter === "forecast"
          ) {
            return district
              .forecast.available;
          }

          if (
            filter === "unavailable"
          ) {
            return !district
              .forecast.available;
          }

          if (filter === "risk") {
            return (
              district.risks.length > 0
            );
          }

          return true;
        }
      );
    }, [
      data,
      search,
      filter
    ]);

  return (
    <section className="panel tablePanel">
      <div className="panelHead">
        <div>
          <h2>
            District Monitoring
          </h2>

          <p>
            Ramalan rasmi MetMalaysia dan
            penilaian risiko SDIP
          </p>
        </div>

        {data && (
          <small>
            {data.summary
              .forecastAvailable}
            /{data.summary
              .totalDistrictLocations}
            {" lokasi tersedia"}
          </small>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(180px, 1fr) minmax(170px, 220px)",
          gap: "10px",
          padding: "0 16px 16px"
        }}
      >
        <input
          type="search"
          aria-label="Cari daerah"
          placeholder="Cari daerah Sabah…"
          value={search}
          onChange={(event) => {
            setSearch(
              event.target.value
            );
          }}
          style={{
            width: "100%",
            borderRadius: "8px",
            border:
              "1px solid rgba(148,163,184,0.25)",
            padding: "10px 12px",
            background: "#0f172a",
            color: "#f8fafc",
            font: "inherit"
          }}
        />

        <select
          aria-label="Tapis daerah"
          value={filter}
          onChange={(event) => {
            setFilter(
              event.target
                .value as FilterValue
            );
          }}
          style={{
            width: "100%",
            borderRadius: "8px",
            border:
              "1px solid rgba(148,163,184,0.25)",
            padding: "10px 12px",
            background: "#0f172a",
            color: "#f8fafc",
            font: "inherit"
          }}
        >
          <option value="all">
            Semua lokasi
          </option>

          <option value="forecast">
            Forecast tersedia
          </option>

          <option value="unavailable">
            Forecast tidak tersedia
          </option>

          <option value="risk">
            Mempunyai risiko
          </option>
        </select>
      </div>

      {loading && (
        <div
          style={{
            padding: "18px"
          }}
        >
          Memuatkan pemantauan daerah…
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            padding: "18px",
            color: "#f87171"
          }}
        >
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        data && (
          <>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Daerah/Lokasi</th>
                    <th>Cuaca Signifikan</th>
                    <th>Suhu</th>
                    <th>Pagi</th>
                    <th>Petang</th>
                    <th>Malam</th>
                    <th>Risiko</th>
                    <th>Kemas Kini</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDistricts.map(
                    (district) => {
                      const risk =
                        district.risks[0];

                      return (
                        <tr
                          key={
                            district.locationId
                          }
                        >
                          <td>
                            <b>
                              {district.district}
                            </b>

                            <br />

                            <small>
                              {
                                district.locationId
                              }
                            </small>
                          </td>

                          <td>
                            {district.forecast
                              .available ? (
                              <span
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  gap: "7px"
                                }}
                              >
                                <i
                                  style={{
                                    width:
                                      "8px",
                                    height:
                                      "8px",
                                    borderRadius:
                                      "50%",
                                    background:
                                      getWeatherColor(
                                        district
                                          .forecast
                                          .significantWeather
                                      ),
                                    flex:
                                      "0 0 auto"
                                  }}
                                />

                                {district
                                  .forecast
                                  .significantWeather ??
                                  "Tidak dinyatakan"}
                              </span>
                            ) : (
                              <span
                                style={{
                                  color:
                                    "#94a3b8"
                                }}
                              >
                                Belum tersedia
                              </span>
                            )}
                          </td>

                          <td>
                            {district.forecast
                              .minimumTemperature !==
                              null &&
                            district.forecast
                              .maximumTemperature !==
                              null
                              ? `${district.forecast.minimumTemperature}°C–${district.forecast.maximumTemperature}°C`
                              : "—"}
                          </td>

                          <td>
                            {district.forecast
                              .morning ??
                              "—"}
                          </td>

                          <td>
                            {district.forecast
                              .afternoon ??
                              "—"}
                          </td>

                          <td>
                            {district.forecast
                              .night ??
                              "—"}
                          </td>

                          <td>
                            {risk ? (
                              <>
                                <span
                                  style={{
                                    display:
                                      "inline-block",
                                    borderRadius:
                                      "999px",
                                    padding:
                                      "4px 8px",
                                    background:
                                      getRiskColor(
                                        risk.riskLevel
                                      ),
                                    color:
                                      "#ffffff",
                                    fontSize:
                                      "0.7rem",
                                    fontWeight:
                                      700
                                  }}
                                >
                                  {
                                    risk.riskLevel
                                  }
                                </span>

                                <br />

                                <small>
                                  {
                                    risk.hazardType
                                  }
                                  {" · "}
                                  {
                                    risk.overallScore
                                  }
                                  {" · SIMULATED"}
                                </small>
                              </>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td>
                            {formatMalaysiaTime(
                              district.forecast
                                .lastUpdated
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}

                  {filteredDistricts
                    .length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "24px"
                        }}
                      >
                        Tiada lokasi sepadan
                        dengan carian atau
                        penapis.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: "12px 16px",
                borderTop:
                  "1px solid rgba(148,163,184,0.15)"
              }}
            >
              <small>
                Menunjukkan{" "}
                {filteredDistricts.length}
                {" daripada "}
                {
                  data.summary
                    .totalDistrictLocations
                }
                {" lokasi · "}
                Sumber cuaca: MetMalaysia
                {" · "}
                Risiko bertanda SIMULATED
                bukan amaran rasmi
                {" · "}
                Data API:{" "}
                {formatMalaysiaTime(
                  data.retrievedAt
                )}
              </small>
            </div>
          </>
        )}
    </section>
  );
}
