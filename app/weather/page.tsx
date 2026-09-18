import Link from "next/link";

import DistrictMonitoring from "@/components/DistrictMonitoring";
import LiveWeatherCard from "@/components/LiveWeatherCard";
import PortalSidebar from "@/components/PortalSidebar";

export default function WeatherPage() {
  return (
    <main className="shell">
      <PortalSidebar />

      <section className="workspace">
        <header>
          <div>
            <h1>
              Sabah Live Weather
            </h1>

            <p>
              Ramalan rasmi semua lokasi
              MetMalaysia di Sabah
            </p>
          </div>

          <Link
            href="/"
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
            ← Dashboard
          </Link>
        </header>

        <div className="content">
          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              marginBottom: "16px"
            }}
          >
            <article
              className="panel"
              style={{
                padding: "16px"
              }}
            >
              <small
                style={{
                  color: "#9fb0c5"
                }}
              >
                Sumber
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontSize: "16px"
                }}
              >
                MetMalaysia
              </strong>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#9fb0c5",
                  fontSize: "12px",
                  lineHeight: 1.5
                }}
              >
                Ramalan diperoleh daripada
                API rasmi MetMalaysia.
              </p>
            </article>

            <article
              className="panel"
              style={{
                padding: "16px"
              }}
            >
              <small
                style={{
                  color: "#9fb0c5"
                }}
              >
                Lokasi tersedia
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontSize: "16px"
                }}
              >
                30 daripada 32
              </strong>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#9fb0c5",
                  fontSize: "12px",
                  lineHeight: 1.5
                }}
              >
                Paitan dan Pensiangan belum
                mempunyai ramalan GENERAL
                untuk tarikh semasa.
              </p>
            </article>

            <article
              className="panel"
              style={{
                padding: "16px"
              }}
            >
              <small
                style={{
                  color: "#9fb0c5"
                }}
              >
                Kemas kini
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontSize: "16px"
                }}
              >
                Setiap jam
              </strong>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#9fb0c5",
                  fontSize: "12px",
                  lineHeight: 1.5
                }}
              >
                Empat batch Supabase Cron
                mengemas kini 32 lokasi
                setiap jam.
              </p>
            </article>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(300px, 440px) minmax(0, 1fr)",
              gap: "14px",
              alignItems: "start"
            }}
            className="weatherPageGrid"
          >
            <LiveWeatherCard />

            <article
              className="panel"
              style={{
                padding: "18px"
              }}
            >
              <small
                style={{
                  display: "block",
                  color: "#5e9fe8",
                  fontWeight: 800,
                  letterSpacing: "0.08em"
                }}
              >
                PANDUAN CUACA
              </small>

              <h2
                style={{
                  margin: "10px 0 0",
                  fontSize: "17px"
                }}
              >
                Cara membaca ramalan
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "16px"
                }}
              >
                <div
                  style={{
                    padding: "12px",
                    border:
                      "1px solid rgba(34,197,94,0.2)",
                    borderLeft:
                      "4px solid #22c55e",
                    borderRadius: "8px",
                    background:
                      "rgba(34,197,94,0.06)"
                  }}
                >
                  <b>
                    Tiada hujan
                  </b>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#9fb0c5",
                      fontSize: "12px",
                      lineHeight: 1.5
                    }}
                  >
                    Tiada hujan dinyatakan
                    bagi tempoh ramalan
                    tersebut.
                  </p>
                </div>

                <div
                  style={{
                    padding: "12px",
                    border:
                      "1px solid rgba(56,189,248,0.2)",
                    borderLeft:
                      "4px solid #38bdf8",
                    borderRadius: "8px",
                    background:
                      "rgba(56,189,248,0.06)"
                  }}
                >
                  <b>
                    Hujan
                  </b>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#9fb0c5",
                      fontSize: "12px",
                      lineHeight: 1.5
                    }}
                  >
                    Hujan dijangka di
                    beberapa atau kebanyakan
                    tempat.
                  </p>
                </div>

                <div
                  style={{
                    padding: "12px",
                    border:
                      "1px solid rgba(245,158,11,0.2)",
                    borderLeft:
                      "4px solid #f59e0b",
                    borderRadius: "8px",
                    background:
                      "rgba(245,158,11,0.06)"
                  }}
                >
                  <b>
                    Ribut petir
                  </b>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#9fb0c5",
                      fontSize: "12px",
                      lineHeight: 1.5
                    }}
                  >
                    Ini ialah ramalan cuaca,
                    bukan semestinya amaran
                    aktif.
                  </p>
                </div>

                <div
                  style={{
                    padding: "12px",
                    border:
                      "1px solid rgba(239,68,68,0.2)",
                    borderLeft:
                      "4px solid #ef4444",
                    borderRadius: "8px",
                    background:
                      "rgba(239,68,68,0.06)"
                  }}
                >
                  <b>
                    Amaran rasmi
                  </b>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#9fb0c5",
                      fontSize: "12px",
                      lineHeight: 1.5
                    }}
                  >
                    Amaran aktif hanya
                    dipaparkan apabila
                    dikeluarkan secara rasmi
                    oleh MetMalaysia.
                  </p>
                </div>
              </div>

              <small
                className="notice"
                style={{
                  marginTop: "16px"
                }}
              >
                Ramalan cuaca dan amaran
                rasmi ialah dua perkara
                berbeza. Rujuk Alert Center
                untuk amaran yang sedang
                aktif.
              </small>
            </article>
          </section>

          <DistrictMonitoring />
        </div>
      </section>

      <nav className="mobileNav">
        <Link href="/">
          Home
        </Link>

        <Link
          href="/weather"
          aria-current="page"
        >
          Weather
        </Link>

        <Link href="/alerts">
          Alerts
        </Link>

        <Link href="/#map">
          Map
        </Link>

        <Link href="/#districts">
          Districts
        </Link>
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .weatherPageGrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
