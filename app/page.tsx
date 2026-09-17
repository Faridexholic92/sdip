"use client";

import dynamic from "next/dynamic";
import LiveRiskRows from "@/components/LiveRiskRows";
import LiveWeatherCard from "@/components/LiveWeatherCard";
import OfficialAlert from "@/components/OfficialAlert";

const SabahMap = dynamic(() => import("@/components/SabahMap"), {
  ssr: false,
  loading: () => (
    <div className="mapLoading">
      Loading geographic map…
    </div>
  )
});

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

const kpis = [
  {
    label: "Official alert feed",
    value: "Live",
    description: "MetMalaysia warnings",
    color: "orange"
  },
  {
    label: "Simulated notices",
    value: "01",
    description: "Supabase record",
    color: "orange"
  },
  {
    label: "Elevated areas",
    value: "01",
    description: "Simulated risk output",
    color: "red"
  },
  {
    label: "Weather location",
    value: "Ranau",
    description: "Official district forecast",
    color: ""
  },
  {
    label: "Data coverage",
    value: "68%",
    description: "Risk-data confidence",
    color: ""
  },
  {
    label: "Data status",
    value: "Live",
    description: "MetMalaysia + Supabase",
    color: ""
  }
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
    name: "Risk API",
    status: "ONLINE"
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

            <small>Operational starter</small>
          </div>
        </div>

        <nav>
          {navigationItems.map((item, index) => (
            <button
              key={item}
              className={index === 0 ? "active" : ""}
              type="button"
            >
              {navigationIcons[index]}

              <span>{item}</span>
            </button>
          ))}
        </nav>

        <div className="system">
          <i />
          Systems operational

          <small>
            MetMalaysia + Supabase connected
          </small>
        </div>
      </aside>

      <section className="workspace">
        <header>
          <div>
            <h1>Sabah Situation Overview</h1>

            <p>
              Real-time monitoring &amp; risk intelligence
            </p>
          </div>

          <input
            aria-label="Search district"
            placeholder="Search district or locality…"
          />
        </header>

        <div className="content">
          <OfficialAlert />

          <div className="kpis">
            {kpis.map((item) => (
              <article key={item.label}>
                <small>{item.label}</small>

                <strong className={item.color}>
                  {item.value}
                </strong>

                <span>{item.description}</span>
              </article>
            ))}
          </div>

          <div className="primary">
            <section className="panel mapPanel">
              <div className="panelHead">
                <div>
                  <h2>Current Multi-Hazard Map</h2>

                  <p>
                    OpenStreetMap base · simulated risk overlay
                  </p>
                </div>

                <button type="button">
                  Risk
                </button>
              </div>

              <SabahMap />
            </section>

            <aside className="stack">
              <LiveWeatherCard />

              <article className="panel intelligence">
                <label>
                  AI DISASTER INTELLIGENCE
                </label>

                <h2>
                  Elevated landslide potential recorded for Ranau
                </h2>

                <p>
                  The current database assessment contains
                  simulated hazard, exposure, vulnerability and
                  capacity inputs.
                </p>

                <ul>
                  <li>
                    Location
                    <b>RANAU</b>
                  </li>

                  <li>
                    Hazard
                    <b>LANDSLIDE</b>
                  </li>

                  <li>
                    Risk level
                    <b>HIGH</b>
                  </li>

                  <li>
                    Confidence
                    <b>72%</b>
                  </li>
                </ul>

                <small className="notice">
                  Simulated risk assessment from Supabase. This is
                  not an official disaster warning.
                </small>
              </article>

              <article className="panel health">
                <h3>
                  Data &amp; system health
                </h3>

                {serviceHealth.map((service) => (
                  <div key={service.name}>
                    <span>{service.name}</span>
                    <b>{service.status}</b>
                  </div>
                ))}
              </article>
            </aside>
          </div>

          <section className="panel tablePanel">
            <div className="panelHead">
              <div>
                <h2>
                  District Risk Monitoring
                </h2>

                <p>
                  Live database records from Supabase PostgreSQL
                </p>
              </div>
            </div>

            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Hazard</th>
                    <th>Score</th>
                    <th>Risk Level</th>
                    <th>Confidence</th>
                    <th>Data Status</th>
                  </tr>
                </thead>

                <LiveRiskRows />
              </table>
            </div>
          </section>

          <section className="panel tablePanel">
            <div className="panelHead">
              <div>
                <h2>
                  Data Transparency
                </h2>

                <p>
                  Sources and assessment classifications
                </p>
              </div>
            </div>

            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Information</th>
                    <th>Source</th>
                    <th>Classification</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Ranau weather forecast</td>
                    <td>MetMalaysia API v2.1</td>
                    <td>Official forecast</td>
                    <td>LIVE</td>
                  </tr>

                  <tr>
                    <td>Sabah weather warnings</td>
                    <td>MetMalaysia API v2.1</td>
                    <td>Official warning</td>
                    <td>LIVE FEED</td>
                  </tr>

                  <tr>
                    <td>Ranau landslide assessment</td>
                    <td>Supabase PostgreSQL</td>
                    <td>Simulated risk data</td>
                    <td>SIMULATED</td>
                  </tr>

                  <tr>
                    <td>Geographic background</td>
                    <td>OpenStreetMap</td>
                    <td>Base map</td>
                    <td>LIVE</td>
                  </tr>

                  <tr>
                    <td>AI risk explanation</td>
                    <td>Qwen AI</td>
                    <td>Not configured</td>
                    <td>PENDING</td>
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
                  Important information for public users
                </p>
              </div>
            </div>

            <div className="tableWrap">
              <table>
                <tbody>
                  <tr>
                    <td>
                      Official weather forecasts and warnings are
                      obtained from MetMalaysia.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Risk assessments marked SIMULATED are for
                      development and interface testing only.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      AI-assisted assessments must not be treated as
                      official emergency warnings or evacuation
                      instructions.
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Users should always follow instructions issued
                      by official authorities and emergency agencies.
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
