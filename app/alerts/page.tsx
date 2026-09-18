import Link from "next/link";

import AlertCenter from "@/components/AlertCenter";

export default function AlertsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#07111f",
        color: "#f4f7fb"
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          minHeight: "72px",
          padding: "12px 28px",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          borderBottom:
            "1px solid rgba(180,204,231,0.16)",
          background:
            "rgba(7,17,31,0.94)",
          backdropFilter: "blur(12px)"
        }}
      >
        <div>
          <small
            style={{
              display: "block",
              marginBottom: "4px",
              color: "#5e9fe8",
              fontWeight: 800,
              letterSpacing: "0.08em"
            }}
          >
            SDIP · OFFICIAL DATA
          </small>

          <h1
            style={{
              margin: 0,
              fontSize: "20px"
            }}
          >
            Sabah Alert Center
          </h1>

          <p
            style={{
              margin: "4px 0 0",
              color: "#9fb0c5",
              fontSize: "12px"
            }}
          >
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
            textDecoration: "none",
            whiteSpace: "nowrap"
          }}
        >
          ← Dashboard
        </Link>
      </header>

      <div
        style={{
          width: "100%",
          maxWidth: "1380px",
          margin: "0 auto",
          padding: "22px 28px 80px"
        }}
      >
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "12px",
            marginBottom: "16px"
          }}
          className="alertInfoGrid"
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
                margin:
                  "7px 0 0",
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
                margin:
                  "7px 0 0",
                color: "#9fb0c5",
                fontSize: "12px",
                lineHeight: 1.5
              }}
            >
              Supabase Cron memeriksa lima
              kategori amaran MetMalaysia.
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
                margin:
                  "7px 0 0",
                color: "#9fb0c5",
                fontSize: "12px",
                lineHeight: 1.5
              }}
            >
              Hanya bulletin yang mengandungi
              maklumat berkaitan Sabah
              dipaparkan.
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
              margin:
                "12px 0 0",
              paddingLeft: "20px",
              color: "#9fb0c5",
              fontSize: "12px",
              lineHeight: 1.75
            }}
          >
            <li>
              Rujuk masa mula dan tamat
              pada setiap amaran.
            </li>

            <li>
              Marker negeri bukan lokasi
              kejadian tepat jika MetMalaysia
              tidak menyediakan koordinat.
            </li>

            <li>
              Ikuti arahan keselamatan
              daripada MetMalaysia, NADMA,
              JPBN Sabah dan agensi
              kecemasan.
            </li>

            <li>
              SDIP tidak mengeluarkan
              amaran sendiri dan tidak
              menggantikan saluran rasmi.
            </li>
          </ul>
        </section>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .alertInfoGrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
