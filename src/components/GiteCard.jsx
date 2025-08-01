// Carte récapitulative pour chaque gîte
import React from 'react';
import { Card, CardContent, Typography, Stack, Box, Divider } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { computeGiteStats, computeAverageCA, computeAverageReservations, computeAverageNights, computeAveragePrice, getOccupationPerYear } from '../utils/dataUtils';
import ProgressBarImpots from './ProgressBarImpots';
import PaymentPieChart from './PaymentPieChart';
import NuiteesPieChart from './NuiteesPieChart';
import OccupationGauge from './OccupationGauge';

// Palette de couleurs utilisée pour les titres
const COLORS = ['#2D8CFF', '#43B77D', '#F5A623', '#7E5BEF', '#FE5C73'];

function GiteCard({ name, data, selectedYear, selectedMonth, availableYears, showUrssaf, showStats }) {
  // Statistiques principales pour la période choisie
  const stats = computeGiteStats(data, selectedYear, selectedMonth);
  // Moyennes annuelles pour comparaison
  const averageCA = computeAverageCA(data, selectedYear, selectedMonth);
  const averageReservations = computeAverageReservations(data, selectedYear, selectedMonth);
  const averageNights = computeAverageNights(data, selectedYear, selectedMonth);
  const averagePrice = computeAveragePrice(data, selectedYear, selectedMonth);

  // Calcul des taux d’occupation pour les années disponibles
  const occupations = getOccupationPerYear(data, availableYears, selectedMonth);

  // Données pour la barre d'impôt (94 % net, 6 % impôt)
  const impot = stats.totalCA * 0.06;
  const caNet = stats.totalCA * 0.94;

  // Préparation des données de CA annuel pour les jauges (mode CA)
  const caByYear = {};
  let maxCA = 0;
  availableYears.forEach(year => {
    // Filtrer pour l'année et le mois éventuel
    let entries = data.filter(e =>
      e.debut &&
      e.debut.getFullYear() === year &&
      (selectedMonth === '' || (e.debut.getMonth() + 1) === Number(selectedMonth))
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
        {/* En-tête de la carte avec période sélectionnée */}
        <Stack direction='row' justifyContent='space-between' alignItems='center' mb={1}>
          <Typography variant='h6' fontWeight={700} color={COLORS[0]}>{name}</Typography>
          <Typography variant='body2' color='#bdbdbd'>{selectedMonth ? `Mois ${selectedMonth}/${selectedYear}` : selectedYear}</Typography>
        </Stack>

        {/* Statistiques principales */}
        <Stack direction='row' spacing={0} justifyContent='space-between' mb={1} flexWrap='wrap'>
          <Stat
            label="Réservations"
            value={
              <Box component="span" display="flex" flexDirection="column" alignItems="flex-start">
                <Typography>{stats.reservations}</Typography>
                {showStats && (
                  <Box display="flex" alignItems="center" mt={0.2}>
                    {stats.reservations >= averageReservations ? (
                      <TrendingUp sx={{ fontSize: 16, color: "#43B77D" }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: "#e53935" }} />
                    )}
                    <Typography variant="caption" ml={0.5} color="text.secondary">
                      {averageReservations.toFixed(1)}
                    </Typography>
                  </Box>
                )}
              </Box>
            }
          />
          <Stat
            label="Nuits"
            value={
              <Box component="span" display="flex" flexDirection="column" alignItems="flex-start">
                <Typography>{stats.totalNights}</Typography>
                {showStats && (
                  <Box display="flex" alignItems="center" mt={0.2}>
                    {stats.totalNights >= averageNights ? (
                      <TrendingUp sx={{ fontSize: 16, color: "#43B77D" }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: "#e53935" }} />
                    )}
                    <Typography variant="caption" ml={0.5} color="text.secondary">
                      {averageNights.toFixed(1)}
                    </Typography>
                  </Box>
                )}
              </Box>
            }
          />
          <Stat
            label="CA brut"
            value={
              <Box component="span" display="flex" flexDirection="column" alignItems="flex-start">
                <Typography>
                  {stats.totalCA.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </Typography>
                {showStats && (
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
                )}
              </Box>
            }
          />

          <Stat label="Durée moy." value={stats.meanStay.toFixed(1) + " nuits"} />
          <Stat
            label="Prix moy/nuit"
            value={
              <Box component="span" display="flex" flexDirection="column" alignItems="flex-start">
                <Typography>
                  {stats.meanPrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </Typography>
                {showStats && (
                  <Box display="flex" alignItems="center" mt={0.2}>
                    {stats.meanPrice >= averagePrice ? (
                      <TrendingUp sx={{ fontSize: 16, color: "#43B77D" }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: "#e53935" }} />
                    )}
                    <Typography variant="caption" ml={0.5} color="text.secondary">
                      {averagePrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </Typography>
                  </Box>
                )}
              </Box>
            }
          />
        </Stack>

        {/* Barre indiquant la part d'impôt */}
        <Box mb={1}>
          <ProgressBarImpots caBrut={stats.totalCA} caNet={caNet} impot={impot} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Graphiques complémentaires : paiements, nuitées et taux d'occupation */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems='flex-start' justifyContent='space-between'>
          <Box sx={{ width: 250, minWidth: 250, maxWidth: 250, mx: "auto" }}>
            <Typography variant='subtitle2' color='text.secondary' mb={1}>Répartition des paiements</Typography>
            {/* Camembert des modes de paiement */}
            <Box sx={{ mb: 3 }}>
              <PaymentPieChart payments={stats.payments} />
            </Box>
            {showUrssaf && (
              <>
                <Typography variant='subtitle2' color='text.secondary' mb={1}>
                  Nuitées par paiement
                </Typography>
                {/* Camembert indiquant les nuitées par type de paiement */}
                <Box sx={{ mb: 1, pl: 0 }}>
                  <NuiteesPieChart nuitees={stats.nuiteesByPayment} />
                </Box>
              </>
            )}
          </Box>


          <Box sx={{ flex: 2 }}>
            <Typography variant='subtitle2' color='text.secondary' mb={1}>Taux d’occupation</Typography>
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
