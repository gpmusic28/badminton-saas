import React, { useEffect, useState } from "react";
import API from "../api";
import { useParams } from "react-router-dom";

export default function FinancePage() {
  const { tournamentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFinance = async () => {
    try {
      const res = await API.get(`/finance/${tournamentId}`);
      setData(res.data);
    } catch (err) {
      alert("Failed to load finance data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!data) return null;

  const { summary, categories } = data;

  return (
    <div style={{ padding: 30 }}>
      <h2>💰 Finance Dashboard</h2>

      {/* SUMMARY CARDS */}
      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <Card title="Expected Revenue" value={summary.expectedRevenue} color="#007bff" />
        <Card title="Collected Revenue" value={summary.collectedRevenue} color="#28a745" />
        <Card title="Total Expense" value={summary.totalExpense} color="#dc3545" />
        <Card title="Net Profit" value={summary.netProfit} color={summary.netProfit >= 0 ? "#28a745" : "#dc3545"} />
      </div>

      {/* CATEGORY TABLE */}
      <h3>Category Breakdown</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <Th>Category</Th>
            <Th>Fee</Th>
            <Th>Total Entries</Th>
            <Th>Verified</Th>
            <Th>Pending</Th>
            <Th>Collected ₹</Th>
            <Th>Expected ₹</Th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, i) => (
            <tr key={i}>
              <Td>{cat.categoryName}</Td>
              <Td>{cat.entryFee}</Td>
              <Td>{cat.totalEntries}</Td>
              <Td style={{ color: "green" }}>{cat.verifiedCount}</Td>
              <Td style={{ color: "orange" }}>{cat.pendingCount}</Td>
              <Td>₹{cat.collectedRevenue}</Td>
              <Td>₹{cat.expectedRevenue}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div style={{
      flex: 1,
      padding: 20,
      borderRadius: 10,
      background: "#111",
      color: "#fff",
      borderLeft: `5px solid ${color}`
    }}>
      <div style={{ fontSize: 14, opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: "bold" }}>₹{value}</div>
    </div>
  );
}

function Th({ children }) {
  return <th style={{ borderBottom: "1px solid #ccc", padding: 10 }}>{children}</th>;
}

function Td({ children, style }) {
  return <td style={{ padding: 10, borderBottom: "1px solid #eee", ...style }}>{children}</td>;
}