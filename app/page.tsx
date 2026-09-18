"use client";

import dynamic from "next/dynamic";

import DistrictMonitoring from "@/components/DistrictMonitoring";
import LiveKpis from "@/components/LiveKpis";
import LiveWeatherCard from "@/components/LiveWeatherCard";
import OfficialAlert from "@/components/OfficialAlert";

const SabahMap = dynamic(
  () => import("@/components/SabahMap"),
  {
    ssr: false,

    loading: () => (
      <div className="mapLoading">
        Loading Esri map…
      </div>
    )
  }
);

const navigationItems = [
  "Dashboard",
  "Live Weather",
  "Disaster Map",
  "Alerts",
  "Risk Analysis",
  "District Monitoring",
  "Historical Analytics",
  "Reports",
  "Data Sources"
];

const navigationIcons = [
  "⌂",
  "☁",
  "◎",
  "!",
  "◈",
  "▦",
  "↗",
  "▤",
  "◉"
];

const serviceHealth = [
  {
    name: "Application",
    status: "ONLINE"
  },
  {
    name: "Supabase Database",
    status: "CONNECTED"
  },
  {
    name: "MetMalaysia Forecast",
    status: "CONNECTED"
  },
  {
    name: "MetMalaysia Warnings",
    status: "CONNECTED"
  },
  {
    name: "Supabase Cron",
    status: "ACTIVE"
  },
  {
    name: "District Monitoring API",
    status: "ONLINE"
  },
  {
    name: "Esri Basemap",
    status: "ACTIVE"
  },
  {
    name: "Qwen gateway",
    status: "NOT CONFIGURED"
  }
];

export default function Home() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <b>SD</b>

          <div>
            <strong>
              Sabah Disaster
              <br />
              Intelligence Portal
            </strong>

            <small>
              Operational starter
            </small>
          </div>
        </div>

        <nav>
          {navigationItems.map(
            (item, index) => (
              <button
                key={item}
                className={
                  index === 0
                    ? "active"
                    : ""
                }
                type="button"
              >
                {navigationIcons[index]}

                <span>
                  {item}
                </span>
              </button>
            )
          )}
        </nav>

        <div className="system">
          <i />

          Systems operational

          <small>
            MetMalaysia, Supabase and
            Esri connected
          </small>
        </div>
      </aside>

      <section className="workspace">
        <header>
          <div>
            <h1>
              Sabah Situation Overview
            </h1>

            <p>
              Official weather monitoring
              and disaster intelligence
            </p>
          </div>

          <input
            aria-label="Search district"
            placeholder="Search district or locality…"
          />
        </header>

        <div className="content">
          <OfficialAlert />

          <LiveKpis />

          <div className="primary">
            <section className="panel mapPanel">
              <div className="panelHead">
                <div>
                  <h2>
                    Sabah Weather &amp;
                    Warning Map
                  </h2>

                  <p>
                    Official MetMalaysia
                    forecasts and active
                    warnings
                  </p>
                </div>

                <button type="button">
                  Layers
                </button>
              </div>

              <SabahMap />
            </section>

            <aside className="stack">
              <LiveWeatherCard />

              <article className="panel health">
                <h3>
                  Data &amp; system health
                </h3>

                {serviceHealth.map(
                  (service) => (
                    <div
                      key={service.name}
                    >
                      <span>
                        {service.name}
                      </span>

                      <b>
                        {service.status}
                      </b>
                    </div>
                  )
                )}

                <small className="notice">
                  Forecast ingestion runs
                  hourly. Official warning
                  ingestion runs every
                  10 minutes.
                </small>
              </article>
            </aside>
          </div>

          <DistrictMonitoring />

          <section className="panel tablePanel">
            <div className="panelHead">
              <div>
                <h2>
                  Data Transparency
                </h2>

                <p>
                  Sources, classifications
                  and update methods
                </p>
              </div>
            </div>

            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      Information
                    </th>

                    <th>
                      Source
                    </th>

                    <th>
                      Classification
                    </th>

                    <th>
                      Update Method
                    </th>

                    <th>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      Sabah district
                      forecasts
                    </td>

                    <td>
                      MetMalaysia API v2.1
                    </td>

                    <td>
                      Official forecast
                    </td>

                    <td>
                      Supabase Cron hourly
                    </td>

                    <td>
                      LIVE
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Sabah weather
                      warnings
                    </td>

                    <td>
                      MetMalaysia API v2.1
                    </td>

                    <td>
                      Official warning
                    </td>

                    <td>
                      Supabase Cron every
                      10 minutes
                    </td>

                    <td>
                      LIVE
                    </td>
                  </tr>

                  <tr>
                    <td>
                      District monitoring
                    </td>

                    <td>
                      SDIP Supabase
                    </td>

                    <td>
                      Aggregated official
                      forecast
                    </td>

                    <td>
                      Generated from stored
                      MetMalaysia records
                    </td>

                    <td>
                      LIVE
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Satellite basemap
                    </td>

                    <td>
                      Esri World Imagery
                    </td>

                    <td>
                      Geographic reference
                    </td>

                    <td>
                      Esri tile service
                    </td>

                    <td>
                      LIVE
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Topographic basemap
                    </td>

                    <td>
                      Esri World Topographic
                      Map
                    </td>

                    <td>
                      Geographic reference
                    </td>

                    <td>
                      Esri tile service
                    </td>

                    <td>
                      AVAILABLE
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Alternative basemap
                    </td>

                    <td>
                      OpenStreetMap
                    </td>

                    <td>
                      Geographic reference
                    </td>

                    <td>
                      Public tile service
                    </td>

                    <td>
                      AVAILABLE
                    </td>
                  </tr>

                  <tr>
                    <td>
                      AI-generated
                      explanation
                    </td>

                    <td>
                      Qwen AI
                    </td>

                    <td>
                      Not operational
                    </td>

                    <td>
                      Not configured
                    </td>

                    <td>
                      DISABLED
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel tablePanel">
            <div className="panelHead">
              <div>
                <h2>
                  Data Coverage Notes
                </h2>

                <p>
                  Known limitations in the
                  current official datasets
                </p>
              </div>
            </div>

            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      Dataset
                    </th>

                    <th>
                      Coverage
                    </th>

                    <th>
                      Limitation
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      District forecast
                    </td>

                    <td>
                      30 of 32 MetMalaysia
                      Sabah locations
                    </td>

                    <td>
                      Paitan and Pensiangan
                      currently return no
                      GENERAL forecast.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Map coordinates
                    </td>

                    <td>
                      Locations with
                      coordinates supplied
                      by MetMalaysia
                    </td>

                    <td>
                      Locations with null
                      coordinates are not
                      assigned invented map
                      positions.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Official warnings
                    </td>

                    <td>
                      Warnings containing
                      Sabah-related
                      information
                    </td>

                    <td>
                      Statewide warnings
                      without exact district
                      locations are shown
                      using a general Sabah
                      marker.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Disaster risk
                    </td>

                    <td>
                      No verified dataset
                      currently connected
                    </td>

                    <td>
                      No fabricated risk
                      scores are published.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel tablePanel">
            <div className="panelHead">
              <div>
                <h2>
                  Trust &amp; Disclaimer
                </h2>

                <p>
                  Important information for
                  portal users
                </p>
              </div>
            </div>

            <div className="tableWrap">
              <table>
                <tbody>
                  <tr>
                    <td>
                      Official forecasts and
                      warnings displayed by
                      SDIP originate from
                      MetMalaysia.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Pulse markers represent
                      active official warning
                      areas identified from
                      MetMalaysia warning
                      text.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      A general Sabah pulse
                      marker does not
                      represent an exact
                      incident coordinate.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      SDIP does not currently
                      publish unverified or
                      fabricated disaster
                      risk scores.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      This portal does not
                      replace instructions
                      issued by MetMalaysia,
                      NADMA, JPBN Sabah or
                      emergency authorities.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Users must follow
                      official evacuation,
                      safety and emergency
                      instructions.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>

      <nav className="mobileNav">
        {[
          "Home",
          "Map",
          "Alerts",
          "Districts",
          "More"
        ].map((item) => (
          <button
            key={item}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>
    </main>
  );
}
