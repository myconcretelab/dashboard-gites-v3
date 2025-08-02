import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from "recharts";
import { getMonthlyCAByYear, getMonthlyCAByGiteForYear, getMonthlyAverageCA } from "../utils/dataUtils";

// Libellés des mois affichés sur l'axe des abscisses
const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function GlobalRevenueChart({ data, labels, selectedOption }) {
  // Détermine si l'utilisateur a choisi une année précise
  const isYearSelected = typeof selectedOption === 'number';
  // Récupération des données de CA selon le mode sélectionné
  const caData = isYearSelected
    ? getMonthlyCAByGiteForYear(data, selectedOption)
    : getMonthlyCAByYear(data);
  // Moyennes mensuelles (toutes années confondues)
  const overallAvg = isYearSelected ? null : getMonthlyAverageCA(data);

  // Maximum global de toutes les valeurs affichées
  const globalMax = Math.max(
    ...labels.flatMap(label => (caData[label]?.months || []).map(m => m.ca)),
    0
  );
  // Arrondi à la centaine supérieure pour l'échelle
  const roundedMax = Math.ceil(globalMax / 100) * 100;
  // Génération des paliers tous les 100 €
  const ticks = Array.from({ length: roundedMax / 100 + 1 }, (_, i) => i * 100);

  // Calcul de la couleur de chaque barre selon son pourcentage du max
  const getColor = (value, max) => {
    const ratio = max ? value / max : 0;
    const hue = 60 - ratio * 60; // 60 (jaune) -> 0 (rouge)
    return `hsla(${hue}, 90%, 70%,100%)`;
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 4, bgcolor: "#fff", boxShadow: "0 4px 32px #ebebeb" }}>
      {labels.map(label => {
        // Données mensuelles pour le gîte ou l'année en cours
        const months = caData[label]?.months || [];
        // Total annuel pour affichage sous le titre
        const total = caData[label]?.total || 0;
        // Moyenne mensuelle à afficher en ligne grise
        const avgMonths = isYearSelected
          ? getMonthlyAverageCA({ [label]: data[label] || [] })
          : overallAvg;
        // Fusion des données de CA et des moyennes
        const chartData = months.map((m, idx) => ({ ...m, avg: avgMonths[idx]?.ca || 0 }));
        // Maximum local pour déterminer la couleur des barres
        const max = Math.max(...months.map(m => m.ca), 0);
        // Titre dynamique selon l'option sélectionnée
        const graphTitle = isYearSelected
          ? `Chiffre d'affaire ${label} ${selectedOption}`
          : `Chiffre d'affaire ${selectedOption !== 'Tous' ? `${selectedOption} ` : ''}${label}`;
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
                
                <XAxis dataKey='month' tickFormatter={m => MONTH_NAMES[m - 1]} stroke="#777777ff"/>
                {/* Échelle harmonisée avec un maximum arrondi et des paliers réguliers */}
                <YAxis domain={[0, roundedMax]} ticks={ticks}  stroke="#777777ff"/>
                <Tooltip formatter={value => value.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'})} />
                <Line type="monotone" dataKey="avg" stroke="#ccc" strokeWidth={5} dot={true} />
                <Bar dataKey="ca">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.ca, max)} />
                  ))}
                  {/* Affiche la valeur de chaque barre au sommet */}
                  <LabelList dataKey='ca' position='top' formatter={value => value.toLocaleString('fr-FR',{ style:'currency', currency:'EUR'})} />
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
