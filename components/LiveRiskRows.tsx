"use client";

import { useEffect, useState } from "react";

type RiskItem = {
  id: string;
  district: string;
  hazardType: string;
  overallScore: string;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  confidenceScore: string;
  dataStatus: string;
  assessmentTime: string;
};

type RiskResponse = {
  status: string;
  count: number;
  items: RiskItem[];
};

export default function LiveRiskRows() {
  const [items, setItems] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRiskData() {
      try {
        const response = await fetch("/api/risk", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Risk API request failed");
        }

        const result: RiskResponse = await response.json();

        if (result.status !== "success") {
          throw new Error("Risk API returned an error");
        }

        setItems(result.items);
      } catch {
        setError("Unable to load risk data.");
      } finally {
        setLoading(false);
      }
    }

    loadRiskData();
  }, []);

  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={6}>Loading Supabase risk data…</td>
        </tr>
      </tbody>
    );
  }

  if (error) {
    return (
      <tbody>
        <tr>
          <td colSpan={6}>{error}</td>
        </tr>
      </tbody>
    );
  }

  if (items.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={6}>No risk assessments available.</td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {items.map((item) => (
        <tr key={item.id}>
          <td>{item.district}</td>
          <td>{item.hazardType}</td>
          <td>{Number(item.overallScore).toFixed(1)}</td>
          <td>
            <b>{item.riskLevel}</b>
          </td>
          <td>{Number(item.confidenceScore).toFixed(0)}%</td>
          <td>{item.dataStatus.toUpperCase()}</td>
        </tr>
      ))}
    </tbody>
  );
}
