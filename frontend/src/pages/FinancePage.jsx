import React, { useEffect, useState } from "react";
import API from "../api";
import { useParams } from "react-router-dom";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7"];

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
    const title = prompt("Expense title");
    const amount = prompt("Amount");

    if (!title || !amount) return;

    await API.post(`/finance/${tournamentId}/expense`, {
      title,
      amount: Number(amount)
    });

    loadFinance();
  };

  const addSponsor = async () => {
    const sponsor = prompt("Sponsor name");
    const amount = prompt("Amount");

    if (!sponsor || !amount) return;

    await API.post(`/finance/${tournamentId}/sponsorship`, {
      sponsor,
      amount: Number(amount)
    });

    loadFinance();
  };

  const deleteExpense = async id => {
    await API.delete(`/finance/${tournamentId}/expense/${id}`);
    loadFinance();
  };

  const deleteSponsor = async id => {
    await API.delete(`/finance/${tournamentId}/sponsorship/${id}`);
    loadFinance();
  };

  if (!data) return <div style={{ padding: 40 }}>Loading...</div>;

  const { summary, categories } = data;

  const pieData = categories.map(c => ({
    name: c.categoryName,
    value: c.collectedRevenue
  }));

  const barData = [
    { name: "Income", value: summary.collectedRevenue },
    { name: "Expense", value: summary.totalExpense },
    { name: "Profit", value: summary.netProfit }
  ];

  return (
    <div style={{ padding: 40, color: "#fff" }}>
      <h2 style={{ marginBottom: 30 }}>💰 Finance Dashboard</h2>

      {/* SUMMARY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: 20,
          marginBottom: 40
        }}
      >
        <SummaryCard title="Expected Revenue" value={summary.expectedRevenue} color="#2563eb" />
        <SummaryCard title="Collected Revenue" value={summary.collectedRevenue} color="#22c55e" />
        <SummaryCard title="Total Expense" value={summary.totalExpense} color="#ef4444" />
        <SummaryCard
          title="Net Profit"
          value={summary.netProfit}
          color={summary.netProfit >= 0 ? "#22c55e" : "#ef4444"}
        />
      </div>

      {/* CHARTS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 30,
          marginBottom: 50
        }}
      >
        {/* PIE */}
        <div style={{ background: "#0f172a", padding: 20, borderRadius: 12 }}>
          <h4>Revenue by Category</h4>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR */}
        <div style={{ background: "#0f172a", padding: 20, borderRadius: 12 }}>
          <h4>Income vs Expense</h4>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <h3>Category Breakdown</h3>

      {categories.map((cat, i) => {
        const percent =
          cat.expectedRevenue === 0
            ? 0
            : Math.round((cat.collectedRevenue / cat.expectedRevenue) * 100);

        return (
          <div
            key={i}
            style={{
              padding: 20,
              borderRadius: 10,
              background: "#111827",
              marginBottom: 15
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                marginTop: 10
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: "100%",
                  background: percent > 70 ? "#22c55e" : "#3b82f6"
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                opacity: 0.8,
                marginTop: 10
              }}
            >
              <span>Total: {cat.totalEntries}</span>
              <span>Verified: {cat.verifiedCount}</span>
              <span>Pending: {cat.pendingCount}</span>
            </div>
          </div>
        );
      })}

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
              background: "#1f2937",
              padding: 12,
              borderRadius: 8,
              marginBottom: 8
            }}
          >
            <span>{e.title}</span>
            <span>
              ₹{e.amount}
              <button
                onClick={() => deleteExpense(e._id)}
                style={{ marginLeft: 10 }}
              >
                ❌
              </button>
            </span>
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
              background: "#1f2937",
              padding: 12,
              borderRadius: 8,
              marginBottom: 8
            }}
          >
            <span>{s.sponsor}</span>
            <span style={{ color: "#22c55e" }}>
              ₹{s.amount}
              <button
                onClick={() => deleteSponsor(s._id)}
                style={{ marginLeft: 10 }}
              >
                ❌
              </button>
            </span>
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
        borderLeft: `6px solid ${color}`
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.6 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: "bold" }}>₹{value}</div>
    </div>
  );
}