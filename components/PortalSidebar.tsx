"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    href: null
  },
  {
    label: "Disaster Map",
    icon: "◎",
    href: null
  },
  {
    label: "Alerts",
    icon: "!",
    href: "/alerts"
  },
  {
    label: "District Monitoring",
    icon: "▦",
    href: null
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

                  <span>
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

                <span>
                  {item.label}
                </span>
              </Link>
            );
          }
        )}
      </nav>

      <div className="system">
        <i />

        Systems operational

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
          position: relative;
          display: flex;
          width: 100%;
          height: 44px;
          padding: 0 12px;
          gap: 11px;
          align-items: center;
          border-radius: 8px;
          color: var(--muted);
          font-size: 16px;
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
          font-size: 16px;
          text-align: left;
          cursor: not-allowed;
          opacity: 0.65;
        }

        .portalNavDisabled > span:nth-child(2) {
          flex: 1;
        }

        .portalNavDisabled em {
          color: #71849b;
          font-size: 8px;
          font-style: normal;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
      `}</style>
    </aside>
  );
}
