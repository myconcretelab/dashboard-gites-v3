// En-tête principal contenant filtres et statistiques globales
import React from 'react';
import {
  Paper, Box, Typography, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Divider, Stack
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import UrssafBox from './UrssafBox';
import ProgressBarImpots from './ProgressBarImpots';
import { computeAverageReservations, computeAverageNights, computeAverageCA } from '../utils/dataUtils';

// Liste des mois pour le sélecteur de période
const months = [
  { value: null, label: '-- année entière --' },
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
];

function Header({
  selectedYear, setSelectedYear,
  selectedMonth, setSelectedMonth,
  availableYears,
  showUrssaf, setShowUrssaf,
  showStats, setShowStats,
  data,
  globalStats
}) {
  const caBrut = globalStats.totalCA;
  const impot = caBrut * 0.06;
  const caNet = caBrut * 0.94;

  const allEntries = Object.values(data).flat();
  const avgReservations = computeAverageReservations(allEntries, selectedYear, selectedMonth);
  const avgNights = computeAverageNights(allEntries, selectedYear, selectedMonth);
  const avgCA = computeAverageCA(allEntries, selectedYear, selectedMonth);
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 4, bgcolor: '#fff', boxShadow: '0 4px 32px #ebebeb' }}>
      {/* Filtres de sélection de période */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems='center' justifyContent='space-between'>
        <Box display='flex' gap={2} flexWrap='wrap'>
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Année</InputLabel>
            <Select
              value={selectedYear}
              label='Année'
              onChange={e => setSelectedYear(e.target.value)}
            >
              {availableYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>Mois</InputLabel>
            <Select
              value={selectedMonth}
              label='Mois'
              onChange={e => setSelectedMonth(e.target.value)}
            >
              {months.map(month => (
                <MenuItem key={month.value || 'all'} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Stack direction='row' spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={showUrssaf}
                  onChange={e => setShowUrssaf(e.target.checked)}
                  color='primary'
                />
              }
              label='Mode déclaration'
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showStats}
                  onChange={e => setShowStats(e.target.checked)}
                  color='primary'
                />
              }
              label='Stats'
            />
          </Stack>
        </Box>
      </Stack>

      {showUrssaf && (
        <Box mt={3}>
          <UrssafBox data={data} selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Bloc de statistiques globales */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="center">
        <HeaderStat label="Total réservations" value={globalStats.totalReservations} average={avgReservations} showStats={showStats} />
        <HeaderStat label="Total nuits réservées" value={globalStats.totalNights} average={avgNights} showStats={showStats} />
        <HeaderStat label="Chiffre d’affaire brut" value={globalStats.totalCA} average={avgCA} isCurrency showStats={showStats} />
      </Stack>

      {/* Barre d'impôt globale */}
      <Box mt={5} sx={{ maxWidth: "60%", mx: "auto" }}>
        <ProgressBarImpots caBrut={caBrut} caNet={caNet} impot={impot} />
      </Box>
    </Paper>
  );
}

export default Header;

function HeaderStat({ label, value, average, isCurrency, showStats }) {
  return (
    <Box textAlign="center">
      <Typography variant="body1" fontWeight={600}>{label}</Typography>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography fontWeight={600} color={isCurrency ? "#388e3c" : "#1976d2"}>
          {isCurrency
            ? value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
            : value}
        </Typography>
        {showStats && (
          <Box display="flex" alignItems="center" mt={0.2}>
            {value >= average ? (
              <TrendingUp sx={{ fontSize: 16, color: "#43B77D" }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: "#e53935" }} />
            )}
            <Typography variant="caption" ml={0.5} color="text.secondary">
              {isCurrency
                ? average.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
                : average.toFixed(1)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
