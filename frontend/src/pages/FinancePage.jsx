import React, { useEffect, useState } from "react";
import API from "../api";
import { useParams } from "react-router-dom";

export default function FinancePage() {
  const { tournamentId } = useParams();
  const [data, setData] = useState(null);

  const loadFinance = () => {
    API.get(`/finance/${tournamentId}`).then(res => {
      setData(res.data);
    });
  };

  useEffect(() => {
    loadFinance();
  }, []);

  const addExpense = async () => {
    const title = prompt("Expense Title");
    const amount = prompt("Amount");

    if (!title || !amount) return;

    await API.post(`/finance/${tournamentId}/expense`, {
      title,
      amount: Number(amount)
    });

    loadFinance();
  };

  const addSponsor = async () => {
    const sponsor = prompt("Sponsor Name");
    const amount = prompt("Amount");

    if (!sponsor || !amount) return;

    await API.post(`/finance/${tournamentId}/sponsorship`, {
      sponsor,
      amount: Number(amount)
    });

    loadFinance();
  };

  if (!data) return <div style={{ padding: 40 }}>Loading...</div>;

  const { summary, categories } = data;

  return (
    <div style={{ padding: 40 }}>
      <h2 style={{ marginBottom: 30 }}>💰 Finance Dashboard</h2>

      {/* SUMMARY GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: 20,
          marginBottom: 40
        }}
      >
        <SummaryCard
          title="Expected Revenue"
          value={summary.expectedRevenue}
          color="#2563eb"
        />
        <SummaryCard
          title="Collected Revenue"
          value={summary.collectedRevenue}
          color="#16a34a"
        />
        <SummaryCard
          title="Total Expense"
          value={summary.totalExpense}
          color="#dc2626"
        />
        <SummaryCard
          title="Net Profit"
          value={summary.netProfit}
          color={summary.netProfit >= 0 ? "#16a34a" : "#dc2626"}
        />
      </div>

      {/* CATEGORY BREAKDOWN */}
      <h3 style={{ marginBottom: 20 }}>Category Breakdown</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {categories.map((cat, i) => {
          const percent =
            cat.expectedRevenue === 0
              ? 0
              : Math.round(
                  (cat.collectedRevenue / cat.expectedRevenue) * 100
                );

          return (
            <div
              key={i}
              style={{
                padding: 20,
                borderRadius: 12,
                background: "#111827",
                color: "#fff"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10
                }}
              >
                <strong>{cat.categoryName}</strong>
                <span>
                  ₹{cat.collectedRevenue} / ₹{cat.expectedRevenue}
                </span>
              </div>

              <div
                style={{
                  height: 8,
                  background: "#374151",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    background: percent > 70 ? "#16a34a" : "#2563eb"
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  opacity: 0.8
                }}
              >
                <span>Total: {cat.totalEntries}</span>
                <span>Verified: {cat.verifiedCount}</span>
                <span>Pending: {cat.pendingCount}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* EXPENSES */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>Expenses</h3>
          <button onClick={addExpense}>+ Add Expense</button>
        </div>

        {(data.expenses || []).map(e => (
          <div
            key={e._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 12,
              background: "#1f2937",
              marginBottom: 8,
              borderRadius: 8,
              color: "#fff"
            }}
          >
            <span>{e.title}</span>
            <span>₹{e.amount}</span>
          </div>
        ))}
      </div>

      {/* SPONSORSHIPS */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>Sponsorships</h3>
          <button onClick={addSponsor}>+ Add Sponsor</button>
        </div>

        {(data.sponsorships || []).map(s => (
          <div
            key={s._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 12,
              background: "#1f2937",
              marginBottom: 8,
              borderRadius: 8,
              color: "#fff"
            }}
          >
            <span>{s.sponsor}</span>
            <span style={{ color: "#16a34a" }}>₹{s.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div
      style={{
        padding: 25,
        borderRadius: 15,
        background: "#0f172a",
        color: "#fff",
        borderLeft: `6px solid ${color}`
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.6 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: "bold" }}>₹{value}</div>
    </div>
  );
}