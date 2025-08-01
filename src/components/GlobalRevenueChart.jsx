import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList, ReferenceLine } from "recharts";
import { getMonthlyCAByYear, getMonthlyCAByGiteForYear } from "../utils/dataUtils";

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function GlobalRevenueChart({ data, labels, selectedOption }) {
  const isYearSelected = typeof selectedOption === "number";
  const caData = isYearSelected
    ? getMonthlyCAByGiteForYear(data, selectedOption)
    : getMonthlyCAByYear(data);

  // On détermine le CA mensuel le plus élevé tous graphiques confondus
  // pour partager la même échelle verticale entre eux
  const globalMax = Math.max(
    ...labels.flatMap(label => (caData[label]?.months || []).map(m => m.ca)),
    0
  );
  // Arrondir à la centaine supérieure afin d'obtenir une dernière graduation cohérente
  const yAxisMax = Math.max(100, Math.ceil(globalMax / 100) * 100);
  // Générer des paliers harmonisés de 100 €
  const ticks = Array.from({ length: yAxisMax / 100 + 1 }, (_, i) => i * 100);

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
        const max = Math.max(...months.map(m => m.ca), 0);
        // Calcul de la moyenne mensuelle : si l'année représentée est l'année en cours,
        // on ne prend en compte que les mois déjà passés
        const currentYear = new Date().getFullYear();
        const yearForData = isYearSelected ? selectedOption : Number(label);
        const monthsForAverage = months.filter(m =>
          yearForData === currentYear ? m.month <= new Date().getMonth() + 1 : true
        );
        const average = monthsForAverage.length
          ? monthsForAverage.reduce((sum, m) => sum + m.ca, 0) / monthsForAverage.length
          : 0;
        const title = isYearSelected
          ? `Chiffre d'affaire ${label} ${selectedOption} (Total: ${total.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'})})`
          : `Chiffre d'affaire ${selectedOption !== "Tous" ? `${selectedOption} ` : ""}${label} (Total: ${total.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'})})`;
        return (
          <Box key={label} mb={4}>
            <Typography variant="h6" align="center" mb={2}>
              {title}
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={months} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={m => MONTH_NAMES[m - 1]} />
                  <YAxis domain={[0, yAxisMax]} ticks={ticks} />
                  <Tooltip formatter={value => value.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'})} />
                  <Bar dataKey="ca">
                    {months.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.ca, max)} />
                    ))}
                    <LabelList
                      dataKey="ca"
                      position="top"
                      formatter={value => value.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'})}
                    />
                  </Bar>
                  {/* Ligne en pointillés grise représentant la moyenne */}
                  <ReferenceLine
                    y={average}
                    stroke="#888"
                    strokeDasharray="3 3"
                    label={{
                      value: average.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'}),
                      position: 'right',
                      fill: '#888',
                      fontSize: 12
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          );
        })}
    </Paper>
  );
}

export default GlobalRevenueChart;
