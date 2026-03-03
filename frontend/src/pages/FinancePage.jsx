import React, { useEffect, useState } from "react";
import API from "../api";
import { useParams } from "react-router-dom";

export default function FinancePage() {
  const { tournamentId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get(`/finance/${tournamentId}`).then(res => {
      setData(res.data);
    });
  }, []);

  if (!data) return <div style={{ padding: 40 }}>Loading...</div>;

  const { summary, categories } = data;

  return (
    <div style={{ padding: 40 }}>
      <h2 style={{ marginBottom: 30 }}>💰 Finance Dashboard</h2>

      {/* SUMMARY GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
        gap: 20,
        marginBottom: 40
      }}>
        <SummaryCard title="Expected Revenue" value={summary.expectedRevenue} color="#2563eb" />
        <SummaryCard title="Collected Revenue" value={summary.collectedRevenue} color="#16a34a" />
        <SummaryCard title="Total Expense" value={summary.totalExpense} color="#dc2626" />
        <SummaryCard title="Net Profit" value={summary.netProfit} color={summary.netProfit >= 0 ? "#16a34a" : "#dc2626"} />
      </div>

      {/* CATEGORY BREAKDOWN */}
      <h3 style={{ marginBottom: 20 }}>Category Breakdown</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {categories.map((cat, i) => {
          const percent = cat.expectedRevenue === 0
            ? 0
            : Math.round((cat.collectedRevenue / cat.expectedRevenue) * 100);

          return (
            <div key={i} style={{
              padding: 20,
              borderRadius: 12,
              background: "#111827",
              color: "#fff"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10
              }}>
                <strong>{cat.categoryName}</strong>
                <span>₹{cat.collectedRevenue} / ₹{cat.expectedRevenue}</span>
              </div>

              <div style={{
                height: 8,
                background: "#374151",
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 12
              }}>
                <div style={{
                  width: `${percent}%`,
                  height: "100%",
                  background: percent > 70 ? "#16a34a" : "#2563eb"
                }} />
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                opacity: 0.8
              }}>
                <span>Total: {cat.totalEntries}</span>
                <span>Verified: {cat.verifiedCount}</span>
                <span>Pending: {cat.pendingCount}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div style={{
      padding: 25,
      borderRadius: 15,
      background: "#0f172a",
      color: "#fff",
      borderLeft: `6px solid ${color}`
    }}>
      <div style={{ fontSize: 14, opacity: 0.6 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: "bold" }}>₹{value}</div>
    </div>
  );
}