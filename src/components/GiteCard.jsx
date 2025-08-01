import React from "react";
import { Card, CardContent, Typography, Stack, Box, Divider } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import { computeGiteStats, computeAverageCA, getOccupationPerYear } from "../utils/dataUtils";
import ProgressBarImpots from "./ProgressBarImpots";
import PaymentPieChart from "./PaymentPieChart";
import NuiteesPieChart from "./NuiteesPieChart";
import OccupationGauge from "./OccupationGauge";

const COLORS = ["#2D8CFF", "#43B77D", "#F5A623", "#7E5BEF", "#FE5C73"];

function GiteCard({ name, data, selectedYear, selectedMonth, availableYears, showUrssaf }) {
  const stats = computeGiteStats(data, selectedYear, selectedMonth);
  const averageCA = computeAverageCA(data, selectedYear, selectedMonth);

  // Pour les jauges d’occupation
  const occupations = getOccupationPerYear(data, availableYears, selectedMonth);

  // Pour la progress bar impôts
  const impot = stats.totalCA * 0.06;
  const caNet = stats.totalCA * 0.94;

  // Pour la vue CA
  const caByYear = {};
  let maxCA = 0;

  availableYears.forEach(year => {
    // Filtrer pour l'année + mois si besoin
    let entries = data.filter(e =>
      e.debut &&
      e.debut.getFullYear() === year &&
      (selectedMonth === "" || (e.debut.getMonth() + 1) === Number(selectedMonth))
      // + filtre HomeExchange ici si tu l’as fait
    );
    const ca = entries.reduce((sum, e) => sum + (e.revenus || 0), 0);
    caByYear[year] = ca;
    if (ca > maxCA) maxCA = ca;
  });


  return (
    <Card elevation={2} sx={{
      borderRadius: 4,
      bgcolor: "#fff",
      boxShadow: "0 2px 16px #e5e5e5"
    }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" fontWeight={700} color={COLORS[0]}>{name}</Typography>
          <Typography variant="body2" color="#bdbdbd">{selectedMonth ? `Mois ${selectedMonth}/${selectedYear}` : selectedYear}</Typography>
        </Stack>

        <Stack direction="row" spacing={0} justifyContent="space-between" mb={1} flexWrap="wrap">
          <Stat label="Réservations" value={stats.reservations} />
          <Stat label="Nuits" value={stats.totalNights} />
          <Stat
            label="CA brut"
            value={
              <Box component="span" display="flex" flexDirection="column" alignItems="flex-start">
                <Typography>
                  {stats.totalCA.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </Typography>
                <Box display="flex" alignItems="center" mt={0.2}>
                  {stats.totalCA >= averageCA ? (
                    <TrendingUp sx={{ fontSize: 16, color: "#43B77D" }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16, color: "#e53935" }} />
                  )}
                  <Typography variant="caption" ml={0.5} color="text.secondary">
                    {averageCA.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </Typography>
                </Box>
              </Box>
            }
          />

          <Stat label="Durée moy." value={stats.meanStay.toFixed(1) + " nuits"} />
          <Stat label="Prix moy/nuit" value={stats.meanPrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} />
        </Stack>

        <Box mb={1}>
          <ProgressBarImpots caBrut={stats.totalCA} caNet={caNet} impot={impot} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ width: 250, minWidth: 250, maxWidth: 250, mx: "auto" }}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>Répartition des paiements</Typography>
            <Box sx={{ mb: 3 }}> {/* Ajoute une marge sous le camembert */}
              <PaymentPieChart payments={stats.payments} />
            </Box>
            {showUrssaf && (
              <>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Nuitées par paiement
                </Typography>
                <Box sx={{ mb: 1, pl: 0 }}> {/* Ajoute un padding-top pour écarter la légende du camembert */}
                  <NuiteesPieChart nuitees={stats.nuiteesByPayment} />
                </Box>
              </>
            )}
          </Box>


          <Box sx={{ flex: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>Taux d’occupation</Typography>
            <OccupationGauge
              occupations={occupations}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
      
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }) {
  return (
    <Box sx={{ minWidth: 85 }}>
      <Typography variant="caption" color="#757575">{label}</Typography>
      <Typography variant="body1" fontWeight={700}>{value}</Typography>
    </Box>
  );
}

export default GiteCard;
