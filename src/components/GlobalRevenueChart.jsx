import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from "recharts";
import { getMonthlyCAByYear, getMonthlyCAByGiteForYear, getMonthlyAverageCA } from "../utils/dataUtils";

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function GlobalRevenueChart({ data, labels, selectedOption }) {
  const isYearSelected = typeof selectedOption === "number";
  const caData = isYearSelected
    ? getMonthlyCAByGiteForYear(data, selectedOption)
    : getMonthlyCAByYear(data);
  const overallAvg = isYearSelected ? null : getMonthlyAverageCA(data);

  const globalMax = Math.max(
    ...labels.flatMap(label => (caData[label]?.months || []).map(m => m.ca)),
    0
  );

  const getColor = (value, max) => {
    const ratio = max ? value / max : 0;
    const hue = 60 - ratio * 60; // 60 (jaune) -> 0 (rouge)
    return `hsl(${hue}, 80%, 55%)`;
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 4, bgcolor: "#fff", boxShadow: "0 4px 32px #ebebeb" }}>
      {labels.map(label => {
        const months = caData[label]?.months || [];
        const total = caData[label]?.total || 0;
        const avgMonths = isYearSelected
          ? getMonthlyAverageCA({ [label]: data[label] || [] })
          : overallAvg;
        const chartData = months.map((m, idx) => ({ ...m, avg: avgMonths[idx]?.ca || 0 }));
        const max = Math.max(...months.map(m => m.ca), 0);
        const graphTitle = isYearSelected
          ? `Chiffre d'affaire ${label} ${selectedOption}`
          : `Chiffre d'affaire ${selectedOption !== "Tous" ? `${selectedOption} ` : ""}${label}`;
        return (
          <Box key={label} mb={4}>
            <Box textAlign="center" mb={1}>
              <Typography variant="h6" fontWeight={600}>{graphTitle}</Typography>
              <Typography variant="subtitle2" color="primary" fontWeight={500}>
                {total.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'})}
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={m => MONTH_NAMES[m - 1]} />
                <YAxis domain={[0, globalMax]} />
                <Tooltip formatter={value => value.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'})} />
                <Line type="monotone" dataKey="avg" stroke="#bbb" strokeWidth={2} dot={false} />
                <Bar dataKey="ca">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.ca, max)} />
                  ))}
                  <LabelList dataKey="ca" position="top" formatter={value => value.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'})} />
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        );
      })}
    </Paper>
  );
}

export default GlobalRevenueChart;
