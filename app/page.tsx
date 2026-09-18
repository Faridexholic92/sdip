"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import DistrictMonitoring from "@/components/DistrictMonitoring";
import LiveKpis from "@/components/LiveKpis";
import LiveWeatherCard from "@/components/LiveWeatherCard";
import OfficialAlert from "@/components/OfficialAlert";
import PortalSidebar from "@/components/PortalSidebar";

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
      <PortalSidebar />

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

          <Link
            href="/alerts"
            style={{
              display: "inline-flex",
              minHeight: "40px",
              padding: "0 14px",
              alignItems: "center",
              justifyContent: "center",
              border:
                "1px solid rgba(180,204,231,0.2)",
              borderRadius: "8px",
              background:
                "rgba(94,159,232,0.12)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            View Alert Center
          </Link>
        </header>

        <div className="content">
          <OfficialAlert />

          <LiveKpis />

          <div
            id="map"
            className="primary"
          >
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

                <span
                  style={{
                    color: "#9fb0c5",
                    fontSize: "11px"
                  }}
                >
                  Esri + MetMalaysia
                </span>
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

          <div id="districts">
            <DistrictMonitoring />
          </div>

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
                      Sabah weather warnings
                    </td>

                    <td>
                      MetMalaysia API v2.1
                    </td>

                    <td>
                      Official warning
                    </td>

                    <td>
                      Cron every 10 minutes
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
                      Stored MetMalaysia
                      records
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
                  current datasets
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
                      Null coordinates are
                      not replaced with
                      invented positions.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Official warnings
                    </td>

                    <td>
                      Sabah-related
                      MetMalaysia bulletins
                    </td>

                    <td>
                      Statewide warnings use
                      a general reference
                      marker.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Disaster risk
                    </td>

                    <td>
                      No verified risk
                      dataset connected
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
                      Forecasts and warnings
                      displayed by SDIP
                      originate from
                      MetMalaysia.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Pulse markers represent
                      active official warning
                      areas identified from
                      MetMalaysia text.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      A general Sabah marker
                      does not represent an
                      exact incident
                      coordinate.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      SDIP does not currently
                      publish fabricated
                      disaster-risk scores.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Always follow official
                      safety instructions
                      from emergency
                      authorities.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>

      <nav className="mobileNav">
        <Link href="/">
          Home
        </Link>

        <a href="#map">
          Map
        </a>

        <Link href="/alerts">
          Alerts
        </Link>

        <a href="#districts">
          Districts
        </a>

        <a href="#sources">
          Sources
        </a>
      </nav>
    </main>
  );
}
