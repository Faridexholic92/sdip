import Link from "next/link";

import LiveKpis from "@/components/LiveKpis";
import PortalSidebar from "@/components/PortalSidebar";

const quickLinks = [
  {
    title: "Live Weather",
    description:
      "Lihat forecast terperinci untuk satu lokasi pilihan.",
    href: "/weather",
    icon: "☁",
    color: "#38bdf8"
  },
  {
    title: "Disaster Map",
    description:
      "Buka peta Esri dengan marker forecast dan pulse amaran.",
    href: "/map",
    icon: "◎",
    color: "#f59e0b"
  },
  {
    title: "Official Alerts",
    description:
      "Semak semua amaran rasmi aktif berkaitan Sabah.",
    href: "/alerts",
    icon: "!",
    color: "#ef4444"
  },
  {
    title: "District Monitor",
    description:
      "Bandingkan forecast bagi semua 32 lokasi Sabah.",
    href: "/districts",
    icon: "▦",
    color: "#22c55e"
  }
];

const systems = [
  {
    name: "MetMalaysia warnings",
    detail: "Semakan setiap 10 minit",
    status: "ACTIVE",
    color: "#86efac"
  },
  {
    name: "MetMalaysia forecasts",
    detail: "Empat batch setiap jam",
    status: "ACTIVE",
    color: "#86efac"
  },
  {
    name: "Supabase database",
    detail: "Official data storage",
    status: "CONNECTED",
    color: "#86efac"
  },
  {
    name: "Esri basemap",
    detail: "Satellite and topographic",
    status: "AVAILABLE",
    color: "#86efac"
  },
  {
    name: "Qwen AI",
    detail: "Belum dikonfigurasi",
    status: "DISABLED",
    color: "#94a3b8"
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
              Ringkasan sistem dan data
              rasmi semasa
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
              textDecoration: "none"
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#ef4444",
                boxShadow:
                  "0 0 0 4px rgba(239,68,68,0.15)"
              }}
            />

            Alert Center
          </Link>
        </header>

        <div className="content">
          <section
            className="panel"
            style={{
              padding: "16px",
              borderColor:
                "rgba(94,159,232,0.25)",
              background:
                "linear-gradient(90deg, rgba(94,159,232,0.1), rgba(11,25,42,0.96))"
            }}
          >
            <small
              style={{
                color: "#5e9fe8",
                fontWeight: 800,
                letterSpacing: "0.08em"
              }}
            >
              OFFICIAL DATA OVERVIEW
            </small>

            <h2
              style={{
                margin: "7px 0 4px",
                fontSize: "17px"
              }}
            >
              Sabah Disaster Intelligence
              Portal
            </h2>

            <p
              style={{
                margin: 0,
                maxWidth: "760px",
                color: "#9fb0c5",
                fontSize: "12px",
                lineHeight: 1.6
              }}
            >
              Dashboard ini hanya
              menunjukkan ringkasan. Gunakan
              halaman khusus untuk melihat
              forecast, peta, amaran dan
              perbandingan lokasi.
            </p>
          </section>

          <LiveKpis />

          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px"
            }}
          >
            {quickLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="panel"
                style={{
                  display: "block",
                  padding: "17px",
                  borderColor:
                    `${item.color}33`,
                  color: "#f4f7fb",
                  textDecoration: "none"
                }}
              >
                <span
                  style={{
                    display: "grid",
                    width: "42px",
                    height: "42px",
                    placeItems: "center",
                    borderRadius: "9px",
                    background:
                      `${item.color}18`,
                    color: item.color,
                    fontSize: "20px",
                    fontWeight: 800
                  }}
                >
                  {item.icon}
                </span>

                <h2
                  style={{
                    margin: "13px 0 5px",
                    fontSize: "15px"
                  }}
                >
                  {item.title}
                </h2>

                <p
                  style={{
                    minHeight: "38px",
                    margin: 0,
                    color: "#9fb0c5",
                    fontSize: "11px",
                    lineHeight: 1.55
                  }}
                >
                  {item.description}
                </p>

                <small
                  style={{
                    display: "block",
                    marginTop: "12px",
                    color: item.color,
                    fontWeight: 800
                  }}
                >
                  Open →
                </small>
              </Link>
            ))}
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "14px",
              marginTop: "14px"
            }}
          >
            <article className="panel health">
              <h3>
                Data pipeline status
              </h3>

              {systems.map((system) => (
                <div key={system.name}>
                  <span>
                    {system.name}

                    <small
                      style={{
                        display: "block",
                        marginTop: "3px",
                        color: "#71849b"
                      }}
                    >
                      {system.detail}
                    </small>
                  </span>

                  <b
                    style={{
                      color: system.color
                    }}
                  >
                    {system.status}
                  </b>
                </div>
              ))}
            </article>

            <article
              id="sources"
              className="panel"
              style={{
                padding: "17px"
              }}
            >
              <small
                style={{
                  color: "#5e9fe8",
                  fontWeight: 800,
                  letterSpacing: "0.08em"
                }}
              >
                DATA SOURCES
              </small>

              <h2
                style={{
                  margin: "8px 0 5px",
                  fontSize: "16px"
                }}
              >
                Official and attributable
                sources
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
                originate from MetMalaysia.
                Geographic basemaps are
                provided by Esri and
                OpenStreetMap.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "14px",
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
                      padding: "6px 9px",
                      border:
                        "1px solid rgba(134,239,172,0.2)",
                      borderRadius: "999px",
                      background:
                        "rgba(34,197,94,0.07)",
                      color: "#86efac",
                      fontSize: "9px",
                      fontWeight: 800
                    }}
                  >
                    {source}
                  </span>
                ))}
              </div>

              <small
                className="notice"
                style={{
                  marginTop: "16px"
                }}
              >
                SDIP tidak menerbitkan skor
                risiko rekaan dan tidak
                menggantikan arahan rasmi
                agensi kecemasan.
              </small>
            </article>
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

        <Link href="/map">
          Map
        </Link>

        <Link href="/alerts">
          Alerts
        </Link>

        <Link href="/districts">
          Districts
        </Link>
      </nav>
    </main>
  );
}
