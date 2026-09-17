"use client";

import { useEffect, useState } from "react";

type MetResult = {
  locationid: string;
  locationname: string;
  locationrootname: string;
  date: string;
  datatype: string;
  value: string | number;
  latitude: number | null;
  longitude: number | null;
  attributes: {
    unit?: string;
    code?: string;
    when?: string;
    valid_from?: string | null;
    valid_to?: string | null;
  };
};

type WeatherResponse = {
  status: string;
  source: string;
  retrievedAt: string;
  data: {
    results: MetResult[];
  };
};

export default function LiveWeatherCard() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        const response = await fetch(
          "/api/weather?type=forecast&locationid=LOCATION%3A251&lang=ms",
          {
            cache: "no-store"
          }
        );

        if (!response.ok) {
          throw new Error("MetMalaysia request failed");
        }

        const result: WeatherResponse = await response.json();

        if (result.status !== "success") {
          throw new Error("MetMalaysia returned an error");
        }

        setWeather(result);
      } catch {
        setError("Ramalan MetMalaysia tidak dapat dimuatkan.");
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, []);

  if (loading) {
    return (
      <article className="panel intelligence">
        <label>LIVE WEATHER · METMALAYSIA</label>
        <h2>Memuatkan ramalan Ranau…</h2>
      </article>
    );
  }

  if (error || !weather) {
    return (
      <article className="panel intelligence">
        <label>LIVE WEATHER · METMALAYSIA</label>
        <h2>Data tidak tersedia</h2>
        <p>{error}</p>
      </article>
    );
  }

  const results = weather.data.results;

  const getValue = (datatype: string) =>
    results.find((item) => item.datatype === datatype)?.value ?? "—";

  const significantWeather = results.find(
    (item) => item.datatype === "FSIGW"
  );

  const forecastDate = results[0]?.date
    ? new Date(results[0].date).toLocaleDateString("ms-MY", {
        timeZone: "Asia/Kuala_Lumpur",
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "—";

  const updatedTime = new Date(weather.retrievedAt).toLocaleString("ms-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <article className="panel intelligence">
      <label>RAMALAN RASMI · METMALAYSIA</label>

      <h2>Cuaca Ranau</h2>

      <p>
        {String(getValue("FSIGW"))}
      </p>

      <ul>
        <li>
          Pagi <b>{String(getValue("FGM"))}</b>
        </li>

        <li>
          Petang <b>{String(getValue("FGA"))}</b>
        </li>

        <li>
          Malam <b>{String(getValue("FGN"))}</b>
        </li>

        <li>
          Suhu <b>{String(getValue("FMINT"))}°C–{String(getValue("FMAXT"))}°C</b>
        </li>
      </ul>

      <small className="notice">
        Tarikh ramalan: {forecastDate}
        <br />
        Dikemas kini: {updatedTime} MYT
        <br />
        Sumber: MetMalaysia
        {significantWeather?.attributes?.when
          ? ` · ${significantWeather.attributes.when}`
          : ""}
      </small>
    </article>
  );
}
