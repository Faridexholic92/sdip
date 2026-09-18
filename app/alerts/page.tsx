import Link from "next/link";

import AlertCenter from "@/components/AlertCenter";
import PortalSidebar from "@/components/PortalSidebar";

export default function AlertsPage() {
  return (
    <main className="shell">
      <PortalSidebar />

      <section className="workspace">
        <header>
          <div>
            <h1>
              Sabah Alert Center
            </h1>

            <p>
              Amaran aktif rasmi berkaitan
              Sabah daripada MetMalaysia
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
                Sumber rasmi
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
                Semua amaran datang daripada
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
                Semakan automatik
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontSize: "16px"
                }}
              >
                Setiap 10 minit
              </strong>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#9fb0c5",
                  fontSize: "12px",
                  lineHeight: 1.5
                }}
              >
                Supabase Cron memeriksa lima
                kategori amaran rasmi.
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
                Skop paparan
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontSize: "16px"
                }}
              >
                Sabah
              </strong>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#9fb0c5",
                  fontSize: "12px",
                  lineHeight: 1.5
                }}
              >
                Hanya bulletin berkaitan
                Sabah dipaparkan.
              </p>
            </article>
          </section>

          <AlertCenter />

          <section
            className="panel"
            style={{
              marginTop: "16px",
              padding: "18px"
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "15px"
              }}
            >
              Panduan penggunaan
            </h2>

            <ul
              style={{
                margin: "12px 0 0",
                paddingLeft: "20px",
                color: "#9fb0c5",
                fontSize: "12px",
                lineHeight: 1.75
              }}
            >
              <li>
                Rujuk masa mula dan tamat
                bagi setiap amaran.
              </li>

              <li>
                Marker negeri bukan lokasi
                kejadian tepat jika tiada
                koordinat rasmi.
              </li>

              <li>
                Ikuti arahan MetMalaysia,
                NADMA, JPBN Sabah dan agensi
                kecemasan.
              </li>

              <li>
                SDIP tidak mengeluarkan
                amaran sendiri.
              </li>
            </ul>
          </section>
        </div>
      </section>

      <nav className="mobileNav">
        <Link href="/">
          Home
        </Link>

        <Link href="/#map">
          Map
        </Link>

        <Link href="/alerts">
          Alerts
        </Link>

        <Link href="/#districts">
          Districts
        </Link>

        <Link href="/#sources">
          Sources
        </Link>
      </nav>
    </main>
  );
}
