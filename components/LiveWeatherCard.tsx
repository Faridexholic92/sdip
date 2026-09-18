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

type ForecastResult = {
  locationid: string;
  locationname: string;
  locationrootid: string | null;
  locationrootname: string | null;
  date: string;
  datatype: string;
  value: string | number | null;
  latitude: number | null;
  longitude: number | null;

  attributes?: {
    unit?: string | null;
    valid_from?: string | null;
    valid_to?: string | null;
  };
};

type ForecastResponse = {
  status: string;
  source: string;
  requestType: string;
  retrievedAt: string;

  data: {
    metadata?: {
      resultset?: {
        count?: number;
        locationid?: string;
        locationname?: string;
        forecast_date?: string;
      };
    };

    results: ForecastResult[];
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

  const [forecast, setForecast] =
    useState<ForecastResponse | null>(null);

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

    async function loadForecast() {
      try {
        setLoading(true);
        setError("");
        setForecast(null);

        const params =
          new URLSearchParams({
            locationid:
              selectedLocationId
          });

        const response = await fetch(
          `/api/forecast?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error(
            "Forecast database request failed"
          );
        }

        const result =
          (await response.json()) as
            ForecastResponse;

        if (
          result.status !== "success"
        ) {
          throw new Error(
            "Forecast API returned an error"
          );
        }

        setForecast(result);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(
          "Forecast error:",
          requestError
        );

        setForecast(null);

        setError(
          "Ramalan rasmi tidak dapat dimuatkan daripada pangkalan data SDIP."
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadForecast();

    return () => {
      controller.abort();
    };
  }, [selectedLocationId]);

  const results =
    forecast?.data?.results ?? [];

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
    forecast?.retrievedAt
      ? formatMalaysiaDateTime(
          forecast.retrievedAt
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
            Membaca ramalan rasmi daripada
            pangkalan data SDIP.
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
        forecast &&
        results.length === 0 && (
          <>
            <h2>
              Ramalan belum tersedia
            </h2>

            <p>
              MetMalaysia belum menyediakan
              ramalan GENERAL untuk{" "}
              {selectedLocation.name} pada
              tarikh semasa.
            </p>

            <small className="notice">
              Tiada rekod ramalan dijumpai
              dalam pangkalan data SDIP.
              <br />

              Lokasi:{" "}
              {selectedLocation.name}
              {" · "}
              {selectedLocation.id}
              <br />

              Bukan ralat sistem
            </small>
          </>
        )}

      {!loading &&
        !error &&
        forecast &&
        results.length > 0 && (
          <>
            <h2>
              Cuaca{" "}
              {results[0]
                ?.locationname ??
                selectedLocation.name}
            </h2>

            <p>
              {significantWeather?.value !==
              null &&
              significantWeather?.value !==
                undefined
                ? String(
                    significantWeather.value
                  )
                : "Tiada cuaca signifikan dinyatakan."}
            </p>

            <ul>
              <li>
                Pagi

                <b>
                  {morning !== undefined &&
                  morning !== null
                    ? String(morning)
                    : "—"}
                </b>
              </li>

              <li>
                Petang

                <b>
                  {afternoon !== undefined &&
                  afternoon !== null
                    ? String(afternoon)
                    : "—"}
                </b>
              </li>

              <li>
                Malam

                <b>
                  {night !== undefined &&
                  night !== null
                    ? String(night)
                    : "—"}
                </b>
              </li>

              <li>
                Suhu

                <b>
                  {minimumTemperature !==
                    undefined &&
                  minimumTemperature !== null
                    ? String(
                        minimumTemperature
                      )
                    : "—"}
                  °C–{maximumTemperature !==
                    undefined &&
                  maximumTemperature !== null
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

              Data disimpan:{" "}
              {updatedTime} MYT
              <br />

              Sumber asal: MetMalaysia
              <br />

              Saluran data: SDIP Supabase
              {" · "}
              {selectedLocation.id}
            </small>
          </>
        )}
    </article>
  );
}
