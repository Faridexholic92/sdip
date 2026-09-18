"use client";

import Link from "next/link";
import {
  usePathname
} from "next/navigation";

type NavigationItem = {
  label: string;
  icon: string;
  href: string | null;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    icon: "⌂",
    href: "/"
  },
  {
    label: "Live Weather",
    icon: "☁",
    href: "/weather"
  },
  {
    label: "Disaster Map",
    icon: "◎",
    href: "/map"
  },
  {
    label: "Alerts",
    icon: "!",
    href: "/alerts"
  },
  {
    label: "District Monitoring",
    icon: "▦",
    href: "/districts"
  },
  {
    label: "Historical Analytics",
    icon: "↗",
    href: null
  },
  {
    label: "Reports",
    icon: "▤",
    href: null
  },
  {
    label: "Data Sources",
    icon: "◉",
    href: null
  }
];

function isActivePath(
  pathname: string,
  href: string
) {
  if (href === "/") {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`
    )
  );
}

export default function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link
        href="/"
        className="portalBrandLink"
        aria-label="SDIP Dashboard"
      >
        <div className="brand">
          <b>SD</b>

          <div>
            <strong>
              Sabah Disaster
              <br />
              Intelligence Portal
            </strong>

            <small>
              Official data portal
            </small>
          </div>
        </div>
      </Link>

      <nav
        aria-label="Portal navigation"
      >
        {navigationItems.map(
          (item) => {
            if (!item.href) {
              return (
                <button
                  key={item.label}
                  type="button"
                  className="portalNavDisabled"
                  disabled
                  aria-disabled="true"
                  title="Coming soon"
                >
                  <span
                    className="portalNavIcon"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span className="portalNavLabel">
                    {item.label}
                  </span>

                  <em>
                    Soon
                  </em>
                </button>
              );
            }

            const active =
              isActivePath(
                pathname,
                item.href
              );

            return (
              <Link
                key={item.label}
                href={item.href}
                className={
                  active
                    ? "portalNavLink active"
                    : "portalNavLink"
                }
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
              >
                <span
                  className="portalNavIcon"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span className="portalNavLabel">
                  {item.label}
                </span>

                {item.label ===
                  "Alerts" && (
                  <span className="portalNavLive">
                    LIVE
                  </span>
                )}
              </Link>
            );
          }
        )}
      </nav>

      <div className="system">
        <div className="portalSystemTitle">
          <i />

          Systems operational
        </div>

        <small>
          MetMalaysia, Supabase and Esri
          connected
        </small>
      </div>

      <style jsx>{`
        .portalBrandLink {
          display: block;
          color: inherit;
          text-decoration: none;
        }

        .portalNavLink {
          display: flex;
          width: 100%;
          height: 44px;
          padding: 0 12px;
          gap: 11px;
          align-items: center;
          border-radius: 8px;
          color: var(--muted);
          font-size: 15px;
          text-decoration: none;
          transition:
            color 160ms ease,
            background 160ms ease;
        }

        .portalNavLink:hover {
          background:
            rgba(
              94,
              159,
              232,
              0.08
            );
          color: #ffffff;
        }

        .portalNavLink.active {
          background:
            rgba(
              94,
              159,
              232,
              0.12
            );
          color: #ffffff;
          box-shadow:
            inset 2px 0
            var(--blue);
        }

        .portalNavIcon {
          display: inline-flex;
          width: 18px;
          flex: 0 0 18px;
          align-items: center;
          justify-content: center;
        }

        .portalNavLabel {
          min-width: 0;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .portalNavLive {
          padding: 3px 5px;
          border-radius: 999px;
          background:
            rgba(
              34,
              197,
              94,
              0.12
            );
          color: #86efac;
          font-size: 7px;
          font-weight: 800;
        }

        .portalNavDisabled {
          display: flex;
          width: 100%;
          height: 44px;
          padding: 0 12px;
          gap: 11px;
          align-items: center;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #65778c;
          font-size: 15px;
          text-align: left;
          cursor: not-allowed;
          opacity: 0.65;
        }

        .portalNavDisabled
          .portalNavLabel {
          min-width: 0;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .portalNavDisabled em {
          color: #71849b;
          font-size: 8px;
          font-style: normal;
          text-transform: uppercase;
        }

        .portalSystemTitle {
          display: flex;
          align-items: center;
        }
      `}</style>
    </aside>
  );
}
