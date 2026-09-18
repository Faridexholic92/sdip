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

type DistrictItem = {
  locationId: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  forecast: DistrictForecast;
};

type DistrictResponse = {
  status: string;
  source: string;
  date: string;

  summary: {
    totalDistrictLocations: number;
    forecastAvailable: number;
    forecastUnavailable: number;
    districtsWithRisk?: number;
  };

  districts: DistrictItem[];
  retrievedAt: string;
};

type FilterValue =
  | "all"
  | "thunderstorm"
  | "rain"
  | "no-rain"
  | "unavailable";

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
    return "#f59e0b";
  }

  if (
    normalized.includes(
      "tiada hujan"
    )
  ) {
    return "#22c55e";
  }

  if (
    normalized.includes("hujan")
  ) {
    return "#38bdf8";
  }

  return "#94a3b8";
}

function matchesWeatherFilter(
  district: DistrictItem,
  filter: FilterValue
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "unavailable") {
    return !district.forecast.available;
  }

  if (!district.forecast.available) {
    return false;
  }

  const weather =
    district.forecast
      .significantWeather
      ?.toLowerCase() ?? "";

  if (filter === "thunderstorm") {
    return weather.includes(
      "ribut petir"
    );
  }

  if (filter === "no-rain") {
    return weather.includes(
      "tiada hujan"
    );
  }

  if (filter === "rain") {
    return (
      weather.includes("hujan") &&
      !weather.includes(
        "ribut petir"
      ) &&
      !weather.includes(
        "tiada hujan"
      )
    );
  }

  return true;
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
          "Data pemantauan lokasi tidak dapat dimuatkan."
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

          return (
            matchesSearch &&
            matchesWeatherFilter(
              district,
              filter
            )
          );
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
            District Weather Monitoring
          </h2>

          <p>
            Ramalan cuaca rasmi
            MetMalaysia untuk lokasi Sabah
          </p>
        </div>

        {data && (
          <small>
            {
              data.summary
                .forecastAvailable
            }
            /
            {
              data.summary
                .totalDistrictLocations
            }
            {" lokasi tersedia"}
          </small>
        )}
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
          aria-label="Cari lokasi Sabah"
          placeholder="Cari lokasi Sabah…"
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
            color: "#f8fafc",
            font: "inherit"
          }}
        />

        <select
          aria-label="Tapis keadaan cuaca"
          value={filter}
          onChange={(event) => {
            setFilter(
              event.target
                .value as FilterValue
            );
          }}
          style={{
            width: "100%",
            padding: "10px 12px",
            border:
              "1px solid rgba(148,163,184,0.25)",
            borderRadius: "8px",
            background: "#0f172a",
            color: "#f8fafc",
            font: "inherit"
          }}
        >
          <option value="all">
            Semua lokasi
          </option>

          <option value="thunderstorm">
            Ribut petir
          </option>

          <option value="rain">
            Hujan
          </option>

          <option value="no-rain">
            Tiada hujan
          </option>

          <option value="unavailable">
            Data belum tersedia
          </option>
        </select>
      </div>

      {loading && (
        <div
          style={{
            padding: "18px"
          }}
        >
          Memuatkan pemantauan cuaca…
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
                    <th>
                      Lokasi
                    </th>

                    <th>
                      Cuaca Signifikan
                    </th>

                    <th>
                      Suhu
                    </th>

                    <th>
                      Pagi
                    </th>

                    <th>
                      Petang
                    </th>

                    <th>
                      Malam
                    </th>

                    <th>
                      Status Data
                    </th>

                    <th>
                      Kemas Kini
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDistricts.map(
                    (district) => (
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
                                  flex:
                                    "0 0 auto",
                                  borderRadius:
                                    "50%",
                                  background:
                                    getWeatherColor(
                                      district
                                        .forecast
                                        .significantWeather
                                    )
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
                          {district.forecast
                            .available ? (
                            <span
                              style={{
                                display:
                                  "inline-block",
                                padding:
                                  "4px 8px",
                                borderRadius:
                                  "999px",
                                background:
                                  "rgba(34,197,94,0.14)",
                                color:
                                  "#86efac",
                                fontSize:
                                  "0.7rem",
                                fontWeight:
                                  700
                              }}
                            >
                              RASMI
                            </span>
                          ) : (
                            <span
                              style={{
                                display:
                                  "inline-block",
                                padding:
                                  "4px 8px",
                                borderRadius:
                                  "999px",
                                background:
                                  "rgba(148,163,184,0.12)",
                                color:
                                  "#94a3b8",
                                fontSize:
                                  "0.7rem",
                                fontWeight:
                                  700
                              }}
                            >
                              TIADA DATA
                            </span>
                          )}
                        </td>

                        <td>
                          {formatMalaysiaTime(
                            district.forecast
                              .lastUpdated
                          )}
                        </td>
                      </tr>
                    )
                  )}

                  {filteredDistricts
                    .length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          padding:
                            "24px",
                          textAlign:
                            "center"
                        }}
                      >
                        Tiada lokasi
                        sepadan dengan
                        carian atau penapis.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding:
                  "12px 16px",
                borderTop:
                  "1px solid rgba(148,163,184,0.15)"
              }}
            >
              <small>
                Menunjukkan{" "}
                {
                  filteredDistricts.length
                }
                {" daripada "}
                {
                  data.summary
                    .totalDistrictLocations
                }
                {" lokasi · "}
                Sumber: MetMalaysia
                {" · "}
                Dikemas kini:{" "}
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
