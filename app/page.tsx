"use client";

import dynamic from "next/dynamic";
import LiveRiskRows from "@/components/LiveRiskRows";

const SabahMap = dynamic(() => import("@/components/SabahMap"), {
  ssr: false,
  loading: () => (
    <div className="mapLoading">Loading geographic map…</div>
  )
});

const nav = [
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

const navIcons = ["⌂", "☁", "◎", "!", "◈", "▦", "↗", "▤", "◉"];

const kpis = [
  ["Official alerts", "—", "Awaiting integration"],
  ["Simulated notices", "01", "Supabase record"],
  ["Elevated areas", "01", "Database output"],
  ["Districts monitored", "01", "Current database coverage"],
  ["Data coverage", "68%", "Medium confidence"],
  ["Last update", "Live", "Supabase"]
];

const serviceHealth = [
  ["Application", "ONLINE"],
  ["Supabase Database", "CONNECTED"],
  ["MetMalaysia", "NOT CONFIGURED"],
  ["Risk API", "ONLINE"],
  ["Qwen gateway", "NOT CONFIGURED"]
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
          {nav.map((item, index) => (
            <button
              key={item}
              className={index === 0 ? "active" : ""}
              type="button"
            >
              {navIcons[index]}

              <span>{item}</span>

              {item === "Alerts" && <em>01</em>}
            </button>
          ))}
        </nav>

        <div className="system">
          <i />
          Systems operational
          <small>Supabase connected</small>
        </div>
      </aside>

      <section className="workspace">
        <header>
          <div>
            <h1>Sabah Situation Overview</h1>
            <p>Real-time monitoring &amp; risk intelligence</p>
          </div>

          <input
            aria-label="Search district"
            placeholder="Search district or locality…"
          />
        </header>

        <div className="content">
          <div className="advisory">
            <b>SIMULATED ADVISORY</b>

            <span>
              <strong>
                Prototype risk assessment available for selected districts
              </strong>

              <small>
                Refer to official authorities for confirmed warnings.
              </small>
            </span>
          </div>

          <div className="kpis">
            {kpis.map((item, index) => (
              <article key={item[0]}>
                <small>{item[0]}</small>

                <strong
                  className={
                    index === 2
                      ? "red"
                      : index === 1
                        ? "orange"
                        : ""
                  }
                >
                  {item[1]}
                </strong>

                <span>{item[2]}</span>
              </article>
            ))}
          </div>

          <div className="primary">
            <section className="panel mapPanel">
              <div className="panelHead">
                <div>
                  <h2>Current Multi-Hazard Map</h2>
                  <p>OpenStreetMap base · simulated risk overlay</p>
                </div>

                <button type="button">Risk</button>
              </div>

              <SabahMap />
            </section>

            <aside className="stack">
              <article className="panel intelligence">
                <label>AI DISASTER INTELLIGENCE</label>

                <h2>
                  Elevated landslide potential recorded for Ranau
                </h2>

                <p>
                  The current database assessment contains simulated hazard,
                  exposure, vulnerability and capacity inputs.
                </p>

                <ul>
                  <li>
                    Location <b>RANAU</b>
                  </li>

                  <li>
                    Hazard <b>LANDSLIDE</b>
                  </li>

                  <li>
                    Risk level <b>HIGH</b>
                  </li>

                  <li>
                    Confidence <b>72%</b>
                  </li>
                </ul>

                <small className="notice">
                  Simulated risk assessment from Supabase. Not an official
                  warning.
                </small>
              </article>

              <article className="panel health">
                <h3>Data &amp; system health</h3>

                {serviceHealth.map((service) => (
                  <div key={service[0]}>
                    <span>{service[0]}</span>
                    <b>{service[1]}</b>
                  </div>
                ))}
              </article>
            </aside>
          </div>

          <section className="panel tablePanel">
            <div className="panelHead">
              <div>
                <h2>District Risk Monitoring</h2>

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
        </div>
      </section>

      <nav className="mobileNav">
        {["Home", "Map", "Alerts", "Districts", "More"].map((item) => (
          <button key={item} type="button">
            {item}
          </button>
        ))}
      </nav>
    </main>
  );
}
