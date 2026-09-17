"use client";

import { useEffect, useState } from "react";

type WarningResult = {
  date: string;
  datatype: string;
  value: {
    heading: {
      en: string;
      ms: string;
    };
    text: {
      en: {
        warning: string;
      };
      ms: {
        warning: string;
      };
    };
  };
  attributes: {
    title: {
      en: string;
      ms: string;
    };
    timestamp: string;
    valid_from: string;
    valid_to: string;
  };
};

type WarningResponse = {
  status: string;
  source: string;
  retrievedAt: string;
  data: {
    metadata: {
      resultset: {
        count: number;
      };
    };
    results: WarningResult[];
  };
};

function extractSabahSection(text: string) {
  const sabahMarker = "Sabah:";
  const sabahStart = text.indexOf(sabahMarker);

  if (sabahStart === -1) {
    return null;
  }

  const fromSabah = text.slice(sabahStart);
  const nextRegion = fromSabah.indexOf("• W.P. Labuan");

  if (nextRegion !== -1) {
    return fromSabah.slice(0, nextRegion).trim();
  }

  return fromSabah.trim();
}

function formatMalaysiaTime(timestamp: string) {
  return new Date(timestamp).toLocaleString("ms-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function OfficialAlert() {
  const [warning, setWarning] = useState<WarningResult | null>(null);
  const [sabahText, setSabahText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWarning() {
      try {
        const response = await fetch(
          "/api/weather?type=warning&category=THUNDERSTORM2",
          {
            cache: "no-store"
          }
        );

        if (!response.ok) {
          throw new Error("MetMalaysia warning request failed");
        }

        const result: WarningResponse = await response.json();

        if (result.status !== "success") {
          throw new Error("MetMalaysia returned an error");
        }

        const sabahWarning = result.data.results.find((item) => {
          const warningText = item.value?.text?.ms?.warning ?? "";

          return warningText.includes("Sabah:");
        });

        if (!sabahWarning) {
          setWarning(null);
          setSabahText(null);
          return;
        }

        const extractedText = extractSabahSection(
          sabahWarning.value.text.ms.warning
        );

        const validTo = new Date(
          sabahWarning.attributes.valid_to
        ).getTime();

        if (Number.isFinite(validTo) && validTo < Date.now()) {
          setWarning(null);
          setSabahText(null);
          return;
        }

        setWarning(sabahWarning);
        setSabahText(extractedText);
      } catch {
        setError("Status amaran MetMalaysia tidak dapat dimuatkan.");
      } finally {
        setLoading(false);
      }
    }

    loadWarning();

    const refreshTimer = window.setInterval(
      loadWarning,
      10 * 60 * 1000
    );

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, []);

  if (loading) {
    return (
      <div className="advisory">
        <b>SEMAKAN RASMI</b>

        <span>
          <strong>Memuatkan amaran MetMalaysia…</strong>
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="advisory">
        <b>DATA TERGENDALA</b>

        <span>
          <strong>Status amaran tidak dapat disahkan</strong>
          <small>{error}</small>
        </span>
      </div>
    );
  }

  if (!warning || !sabahText) {
    return (
      <div className="advisory">
        <b>TIADA AMARAN</b>

        <span>
          <strong>
            Tiada amaran ribut petir aktif untuk Sabah
          </strong>

          <small>
            Sumber: MetMalaysia · Semakan automatik setiap 10 minit
          </small>
        </span>
      </div>
    );
  }

  return (
    <div className="advisory">
      <b>AMARAN RASMI</b>

      <span>
        <strong>
          {warning.value.heading.ms} — Sabah
        </strong>

        <small>{sabahText}</small>

        <small>
          Sah dari{" "}
          {formatMalaysiaTime(warning.attributes.valid_from)}
          {" hingga "}
          {formatMalaysiaTime(warning.attributes.valid_to)}
          {" · Sumber: MetMalaysia"}
        </small>
      </span>
    </div>
  );
}
