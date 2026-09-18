import Link from "next/link";

import PortalSidebar from "@/components/PortalSidebar";
import SabahMap from "@/components/SabahMap";

export default function MapPage() {
  return (
    <main className="shell">
      <PortalSidebar />

      <section className="workspace">
        <header>
          <div>
            <h1>
              Sabah Disaster Map
            </h1>

            <p>
              Peta forecast dan amaran rasmi
              MetMalaysia
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
            className="panel"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "1px",
              marginBottom: "14px",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                padding: "14px"
              }}
            >
              <small
                style={{
                  color: "#9fb0c5"
                }}
              >
                Basemap
              </small>

              <b
                style={{
                  display: "block",
                  marginTop: "5px"
                }}
              >
                Esri Satellite
              </b>
            </div>

            <div
              style={{
                padding: "14px",
                borderLeft:
                  "1px solid rgba(180,204,231,0.16)"
              }}
            >
              <small
                style={{
                  color: "#9fb0c5"
                }}
              >
                Forecast markers
              </small>

              <b
                style={{
                  display: "block",
                  marginTop: "5px"
                }}
              >
                MetMalaysia
              </b>
            </div>

            <div
              style={{
                padding: "14px",
                borderLeft:
                  "1px solid rgba(180,204,231,0.16)"
              }}
            >
              <small
                style={{
                  color: "#9fb0c5"
                }}
              >
                Pulse markers
              </small>

              <b
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#f87171"
                }}
              >
                Active official warnings
              </b>
            </div>
          </section>

          <section className="panel mapPanel">
            <div className="panelHead">
              <div>
                <h2>
                  Interactive Official Data
                  Map
                </h2>

                <p>
                  Klik marker untuk forecast
                  atau maklumat amaran
                </p>
              </div>

              <span
                style={{
                  color: "#86efac",
                  fontSize: "10px",
                  fontWeight: 800
                }}
              >
                LIVE
              </span>
            </div>

            <SabahMap />
          </section>

          <section
            className="panel"
            style={{
              marginTop: "14px",
              padding: "16px"
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "14px"
              }}
            >
              Map interpretation
            </h2>

            <ul
              style={{
                margin: "10px 0 0",
                paddingLeft: "20px",
                color: "#9fb0c5",
                fontSize: "11px",
                lineHeight: 1.7
              }}
            >
              <li>
                Marker berwarna menunjukkan
                forecast cuaca signifikan.
              </li>

              <li>
                Pulse merah menunjukkan
                amaran rasmi aktif.
              </li>

              <li>
                Marker umum Sabah bukan
                koordinat kejadian tepat.
              </li>

              <li>
                Gunakan layer control untuk
                menukar basemap dan lapisan.
              </li>
            </ul>
          </section>
        </div>
      </section>

      <nav className="mobileNav">
        <Link href="/">
          Home
        </Link>

        <Link href="/weather">
          Weather
        </Link>

        <Link
          href="/map"
          aria-current="page"
        >
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
