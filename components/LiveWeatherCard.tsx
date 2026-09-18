"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  DEFAULT_SABAH_MET_LOCATION,
  SABAH_MET_LOCATIONS
} from "@/lib/metMalaysiaLocations";

type MetResult = {
  locationid: string;
  locationname: string;
  locationrootid: string;
  locationrootname: string;
  date: string;
  datatype: string;
  value: string | number;
  latitude: number | null;
  longitude: number | null;

  attributes?: {
    unit?: string;
    code?: string;
    when?: string;
    ref?: string | null;
    valid_from?: string | null;
    valid_to?: string | null;
  };
};

type WeatherResponse = {
  status: string;
  source: string;
  requestType: string;
  retrievedAt: string;

  data: {
    metadata?: {
      resultset?: {
        count?: number;
      };
    };

    results: MetResult[];
  };
};

function formatMalaysiaDate(
  timestamp: string
) {
  return new Date(timestamp).toLocaleDateString(
    "ms-MY",
    {
      timeZone: "Asia/Kuala_Lumpur",
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

function formatMalaysiaDateTime(
  timestamp: string
) {
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

export default function LiveWeatherCard() {
  const [
    selectedLocationId,
    setSelectedLocationId
  ] = useState(
    DEFAULT_SABAH_MET_LOCATION.id
  );

  const [weather, setWeather] =
    useState<WeatherResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const selectedLocation = useMemo(
    () =>
      SABAH_MET_LOCATIONS.find(
        (location) =>
          location.id ===
          selectedLocationId
      ) ?? DEFAULT_SABAH_MET_LOCATION,
    [selectedLocationId]
  );

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadWeather() {
      try {
        setLoading(true);
        setError("");
        setWeather(null);

        const params =
          new URLSearchParams({
            type: "forecast",
            locationid:
              selectedLocationId,
            lang: "ms"
          });

        const response = await fetch(
          `/api/weather?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error(
            "MetMalaysia request failed"
          );
        }

        const result =
          (await response.json()) as
            WeatherResponse;

        if (
          result.status !== "success"
        ) {
          throw new Error(
            "MetMalaysia returned an error"
          );
        }

        setWeather(result);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(
          "Weather forecast error:",
          requestError
        );

        setWeather(null);

        setError(
          "Ramalan rasmi tidak dapat dimuatkan."
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadWeather();

    return () => {
      controller.abort();
    };
  }, [selectedLocationId]);

  const results =
    weather?.data?.results ?? [];

  function getValue(
    datatype: string
  ) {
    return results.find(
      (item) =>
        item.datatype === datatype
    )?.value;
  }

  const morning =
    getValue("FGM");

  const afternoon =
    getValue("FGA");

  const night =
    getValue("FGN");

  const minimumTemperature =
    getValue("FMINT");

  const maximumTemperature =
    getValue("FMAXT");

  const significantWeather =
    results.find(
      (item) =>
        item.datatype === "FSIGW"
    );

  const forecastDate =
    results[0]?.date
      ? formatMalaysiaDate(
          results[0].date
        )
      : "—";

  const updatedTime =
    weather?.retrievedAt
      ? formatMalaysiaDateTime(
          weather.retrievedAt
        )
      : "—";

  return (
    <article className="panel intelligence">
      <label>
        RAMALAN RASMI · METMALAYSIA
      </label>

      <div
        style={{
          marginTop: "10px",
          marginBottom: "14px"
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "0.75rem",
            marginBottom: "5px",
            opacity: 0.75
          }}
        >
          Pilih lokasi Sabah
        </span>

        <select
          aria-label="Pilih lokasi cuaca Sabah"
          value={selectedLocationId}
          onChange={(event) => {
            setSelectedLocationId(
              event.target.value
            );
          }}
          style={{
            width: "100%",
            borderRadius: "8px",
            border:
              "1px solid rgba(148,163,184,0.3)",
            padding: "9px 10px",
            background: "#0f172a",
            color: "#f8fafc",
            font: "inherit",
            cursor: "pointer"
          }}
        >
          {SABAH_MET_LOCATIONS.map(
            (location) => (
              <option
                key={location.id}
                value={location.id}
              >
                {location.name}
              </option>
            )
          )}
        </select>
      </div>

      {loading && (
        <>
          <h2>
            Memuatkan cuaca{" "}
            {selectedLocation.name}…
          </h2>

          <p>
            Mendapatkan ramalan rasmi
            daripada MetMalaysia.
          </p>
        </>
      )}

      {!loading && error && (
        <>
          <h2>
            Data tidak dapat dimuatkan
          </h2>

          <p>{error}</p>

          <small className="notice">
            Lokasi:{" "}
            {selectedLocation.name}
            {" · "}
            {selectedLocation.id}
            <br />

            Sila cuba semula kemudian.
          </small>
        </>
      )}

      {!loading &&
        !error &&
        weather &&
        results.length === 0 && (
          <>
            <h2>
              Ramalan belum tersedia
            </h2>

            <p>
              MetMalaysia belum
              menyediakan ramalan GENERAL
              untuk{" "}
              {selectedLocation.name} pada
              tarikh semasa.
            </p>

            <small className="notice">
              Permintaan berjaya tetapi
              tiada rekod dipulangkan.
              <br />

              Lokasi:{" "}
              {selectedLocation.name}
              {" · "}
              {selectedLocation.id}
              <br />

              Sumber: MetMalaysia
              {" · "}
              Bukan ralat sistem
            </small>
          </>
        )}

      {!loading &&
        !error &&
        weather &&
        results.length > 0 && (
          <>
            <h2>
              Cuaca{" "}
              {results[0]
                ?.locationname ??
                selectedLocation.name}
            </h2>

            <p>
              {significantWeather
                ? String(
                    significantWeather.value
                  )
                : "Tiada cuaca signifikan dinyatakan."}
            </p>

            <ul>
              <li>
                Pagi

                <b>
                  {morning !== undefined
                    ? String(morning)
                    : "—"}
                </b>
              </li>

              <li>
                Petang

                <b>
                  {afternoon !== undefined
                    ? String(afternoon)
                    : "—"}
                </b>
              </li>

              <li>
                Malam

                <b>
                  {night !== undefined
                    ? String(night)
                    : "—"}
                </b>
              </li>

              <li>
                Suhu

                <b>
                  {minimumTemperature !==
                  undefined
                    ? String(
                        minimumTemperature
                      )
                    : "—"}
                  °C–{maximumTemperature !==
                  undefined
                    ? String(
                        maximumTemperature
                      )
                    : "—"}
                  °C
                </b>
              </li>
            </ul>

            <small className="notice">
              Tarikh ramalan:{" "}
              {forecastDate}
              <br />

              Dikemas kini:{" "}
              {updatedTime} MYT
              <br />

              Sumber: MetMalaysia
              {" · "}
              {selectedLocation.id}

              {significantWeather
                ?.attributes?.when
                ? ` · ${significantWeather.attributes.when}`
                : ""}
            </small>
          </>
        )}
    </article>
  );
}
