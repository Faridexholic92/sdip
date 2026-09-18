"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import LiveKpis from "@/components/LiveKpis";
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
    status: "ONLINE",
    color: "#86efac"
  },
  {
    name: "Supabase Database",
    status: "CONNECTED",
    color: "#86efac"
  },
  {
    name: "MetMalaysia Forecast",
    status: "CONNECTED",
    color: "#86efac"
  },
  {
    name: "MetMalaysia Warnings",
    status: "CONNECTED",
    color: "#86efac"
  },
  {
    name: "Supabase Cron",
    status: "ACTIVE",
    color: "#86efac"
  },
  {
    name: "Esri Basemap",
    status: "ACTIVE",
    color: "#86efac"
  },
  {
    name: "Qwen AI",
    status: "DISABLED",
    color: "#94a3b8"
  }
];

const quickActions = [
  {
    title: "Live Weather",
    description:
      "Lihat forecast terperinci dan pilih lokasi Sabah.",
    href: "/weather",
    label: "Open Weather",
    color: "#38bdf8",
    icon: "☁"
  },
  {
    title: "Official Alerts",
    description:
      "Semak semua amaran aktif rasmi daripada MetMalaysia.",
    href: "/alerts",
    label: "Open Alerts",
    color: "#ef4444",
    icon: "!"
  },
  {
    title: "Weather Map",
    description:
      "Lihat forecast dan amaran aktif pada peta Esri.",
    href: "#map",
    label: "View Map",
    color: "#f59e0b",
    icon: "◎"
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
              Ringkasan data cuaca dan
              amaran rasmi semasa
            </p>
          </div>

          <Link
            href="/alerts"
            style={{
              display: "inline-flex",
              minHeight: "40px",
              padding: "0 14px",
              gap: "8px",
              alignItems: "center",
              justifyContent: "center",
              border:
                "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px",
              background:
                "rgba(239,68,68,0.1)",
              color: "#fecaca",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap"
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#ef4444",
                boxShadow:
                  "0 0 0 4px rgba(239,68,68,0.14)"
              }}
            />

            Alert Center
          </Link>
        </header>

        <div className="content">
          <section
            className="panel"
            style={{
              display: "flex",
              minHeight: "58px",
              padding: "12px 16px",
              gap: "14px",
              alignItems: "center",
              justifyContent:
                "space-between",
              borderColor:
                "rgba(94,159,232,0.25)",
              background:
                "linear-gradient(90deg, rgba(94,159,232,0.1), rgba(11,25,42,0.95))"
            }}
          >
            <div>
              <small
                style={{
                  color: "#5e9fe8",
                  fontWeight: 800,
                  letterSpacing:
                    "0.08em"
                }}
              >
                OFFICIAL DATA
              </small>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#dbe7f5",
                  fontSize: "13px"
                }}
              >
                Data forecast dan amaran
                dalam portal ini berasal
                daripada MetMalaysia.
              </p>
            </div>

            <small
              style={{
                color: "#9fb0c5",
                textAlign: "right",
                lineHeight: 1.5
              }}
            >
              Warnings: setiap 10 minit
              <br />
              Forecasts: setiap jam
            </small>
          </section>

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
                    Forecast rasmi dan
                    amaran aktif pada peta
                    Esri
                  </p>
                </div>

                <span
                  style={{
                    display:
                      "inline-flex",
                    gap: "6px",
                    alignItems:
                      "center",
                    color: "#9fb0c5",
                    fontSize: "10px",
                    whiteSpace: "nowrap"
                  }}
                >
                  <i
                    style={{
                      display:
                        "inline-block",
                      width: "7px",
                      height: "7px",
                      borderRadius:
                        "50%",
                      background:
                        "#22c55e"
                    }}
                  />

                  LIVE DATA
                </span>
              </div>

              <SabahMap />
            </section>

            <aside className="stack">
              <article
                className="panel"
                style={{
                  padding: "16px"
                }}
              >
                <small
                  style={{
                    display: "block",
                    color: "#5e9fe8",
                    fontWeight: 800,
                    letterSpacing:
                      "0.08em"
                  }}
                >
                  QUICK ACCESS
                </small>

                <h2
                  style={{
                    margin:
                      "8px 0 4px",
                    fontSize: "16px"
                  }}
                >
                  Portal functions
                </h2>

                <p
                  style={{
                    margin:
                      "0 0 14px",
                    color: "#9fb0c5",
                    fontSize: "12px",
                    lineHeight: 1.5
                  }}
                >
                  Buka halaman khusus untuk
                  maklumat terperinci.
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: "10px"
                  }}
                >
                  {quickActions.map(
                    (action) => (
                      <Link
                        key={action.title}
                        href={action.href}
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "38px minmax(0, 1fr)",
                          gap: "10px",
                          padding: "11px",
                          alignItems:
                            "center",
                          border:
                            `1px solid ${action.color}33`,
                          borderRadius:
                            "8px",
                          background:
                            `${action.color}0d`,
                          color:
                            "#f4f7fb",
                          textDecoration:
                            "none"
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            display:
                              "grid",
                            width: "38px",
                            height: "38px",
                            placeItems:
                              "center",
                            borderRadius:
                              "8px",
                            background:
                              `${action.color}1f`,
                            color:
                              action.color,
                            fontSize:
                              "18px",
                            fontWeight:
                              800
                          }}
                        >
                          {action.icon}
                        </span>

                        <span>
                          <b
                            style={{
                              display:
                                "block",
                              fontSize:
                                "12px"
                            }}
                          >
                            {action.title}
                          </b>

                          <small
                            style={{
                              display:
                                "block",
                              marginTop:
                                "3px",
                              color:
                                "#9fb0c5",
                              fontSize:
                                "10px",
                              lineHeight:
                                1.4
                            }}
                          >
                            {
                              action.description
                            }
                          </small>

                          <small
                            style={{
                              display:
                                "block",
                              marginTop:
                                "5px",
                              color:
                                action.color,
                              fontSize:
                                "9px",
                              fontWeight:
                                800
                            }}
                          >
                            {action.label} →
                          </small>
                        </span>
                      </Link>
                    )
                  )}
                </div>
              </article>

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

                      <b
                        style={{
                          color:
                            service.color
                        }}
                      >
                        {service.status}
                      </b>
                    </div>
                  )
                )}

                <small
                  className="notice"
                  style={{
                    marginTop: "12px"
                  }}
                >
                  Status ini ialah ringkasan
                  konfigurasi portal. Data
                  timestamp dipaparkan pada
                  halaman terperinci.
                </small>
              </article>
            </aside>
          </div>

          <section
            id="sources"
            className="panel"
            style={{
              marginTop: "14px",
              padding: "16px"
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems:
                  "flex-start",
                justifyContent:
                  "space-between",
                flexWrap: "wrap"
              }}
            >
              <div
                style={{
                  maxWidth: "700px"
                }}
              >
                <small
                  style={{
                    display: "block",
                    color: "#5e9fe8",
                    fontWeight: 800,
                    letterSpacing:
                      "0.08em"
                  }}
                >
                  DATA TRANSPARENCY
                </small>

                <h2
                  style={{
                    margin:
                      "8px 0 5px",
                    fontSize: "15px"
                  }}
                >
                  Official sources only
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#9fb0c5",
                    fontSize: "12px",
                    lineHeight: 1.6
                  }}
                >
                  Forecasts and warnings
                  originate from
                  MetMalaysia. Map tiles
                  are provided by Esri and
                  OpenStreetMap. SDIP does
                  not currently publish
                  fabricated disaster-risk
                  scores.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap"
                }}
              >
                {[
                  "MetMalaysia",
                  "Supabase",
                  "Esri",
                  "OpenStreetMap"
                ].map((source) => (
                  <span
                    key={source}
                    style={{
                      padding:
                        "6px 9px",
                      border:
                        "1px solid rgba(134,239,172,0.2)",
                      borderRadius:
                        "999px",
                      background:
                        "rgba(34,197,94,0.07)",
                      color:
                        "#86efac",
                      fontSize:
                        "9px",
                      fontWeight: 800
                    }}
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section
            className="panel"
            style={{
              marginTop: "14px",
              padding: "14px 16px",
              borderColor:
                "rgba(234,194,107,0.2)",
              background:
                "rgba(234,194,107,0.04)"
            }}
          >
            <small
              style={{
                color: "#eac26b",
                fontWeight: 800
              }}
            >
              IMPORTANT
            </small>

            <p
              style={{
                margin: "6px 0 0",
                color: "#9fb0c5",
                fontSize: "11px",
                lineHeight: 1.6
              }}
            >
              SDIP is an information
              portal and does not replace
              official emergency
              instructions. Always follow
              MetMalaysia, NADMA, JPBN
              Sabah and emergency
              authorities.
            </p>
          </section>
        </div>
      </section>

      <nav className="mobileNav">
        <Link
          href="/"
          aria-current="page"
        >
          Home
        </Link>

        <Link href="/weather">
          Weather
        </Link>

        <Link href="/alerts">
          Alerts
        </Link>

        <a href="#map">
          Map
        </a>

        <a href="#sources">
          Sources
        </a>
      </nav>
    </main>
  );
}
