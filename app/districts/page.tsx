import Link from "next/link";

import DistrictMonitoring from "@/components/DistrictMonitoring";
import PortalSidebar from "@/components/PortalSidebar";

export default function DistrictsPage() {
  return (
    <main className="shell">
      <PortalSidebar />

      <section className="workspace">
        <header>
          <div>
            <h1>
              Sabah District Monitor
            </h1>

            <p>
              Perbandingan forecast semua
              lokasi MetMalaysia Sabah
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
              gap: "12px"
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
                Total lokasi
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: "7px",
                  fontSize: "22px"
                }}
              >
                32
              </strong>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#9fb0c5",
                  fontSize: "11px"
                }}
              >
                Lokasi MetMalaysia Sabah
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
                Forecast tersedia
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: "7px",
                  color: "#86efac",
                  fontSize: "22px"
                }}
              >
                30
              </strong>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#9fb0c5",
                  fontSize: "11px"
                }}
              >
                Data rasmi semasa
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
                Tiada forecast
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: "7px",
                  color: "#fbbf24",
                  fontSize: "22px"
                }}
              >
                2
              </strong>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#9fb0c5",
                  fontSize: "11px"
                }}
              >
                Paitan dan Pensiangan
              </p>
            </article>
          </section>

          <DistrictMonitoring />
        </div>
      </section>

      <nav className="mobileNav">
        <Link href="/">
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

        <Link
          href="/districts"
          aria-current="page"
        >
          Districts
        </Link>
      </nav>
    </main>
  );
}
