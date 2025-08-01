import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from "recharts";
import { getMonthlyCAByYear } from "../utils/dataUtils";

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function GlobalRevenueChart({ data, availableYears, selectedGite }) {
  const caByYear = getMonthlyCAByYear(data);

  const getColor = (value, max) => {
    const ratio = max ? value / max : 0;
    const hue = 60 - ratio * 60; // 60 (jaune) -> 0 (rouge)
    return `hsl(${hue}, 80%, 55%)`;
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 4, bgcolor: "#fff", boxShadow: "0 4px 32px #ebebeb" }}>
      {availableYears.map(year => {
        const months = caByYear[year]?.months || [];
        const total = caByYear[year]?.total || 0;
        const max = Math.max(...months.map(m => m.ca), 0);
        const giteLabel = selectedGite && selectedGite !== "Tous" ? `${selectedGite} ` : "";
        return (
          <Box key={year} mb={4}>
            <Typography variant="h6" align="center" mb={2}>
              {`Chiffre d'affaire ${giteLabel}${year} (Total: ${total.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'})})`}
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={months} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={m => MONTH_NAMES[m - 1]} />
                <YAxis />
                <Tooltip formatter={value => value.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'})} />
                <Bar dataKey="ca">
                  {months.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.ca, max)} />
                  ))}
                  <LabelList dataKey="ca" position="top" formatter={value => value.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'})} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      })}
    </Paper>
  );
}

export default GlobalRevenueChart;
