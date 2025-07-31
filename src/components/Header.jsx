import React from "react";
import {
  Paper, Box, Typography, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Divider, Stack
} from "@mui/material";
import UrssafBox from "./UrssafBox";
import ProgressBarImpots from "./ProgressBarImpots";

const months = [
  { value: null, label: "-- année entière --" },
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
];

function Header({
  selectedYear, setSelectedYear,
  selectedMonth, setSelectedMonth,
  availableYears,
  showUrssaf, setShowUrssaf,
  data,
  globalStats
}) {
  const caBrut = globalStats.totalCA;
  const impot = caBrut * 0.06;
  const caNet = caBrut * 0.94;
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 4, bgcolor: "#fff", boxShadow: "0 4px 32px #ebebeb" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center" justifyContent="space-between">
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Année</InputLabel>
            <Select
              value={selectedYear}
              label="Année"
              onChange={e => setSelectedYear(e.target.value)}
            >
              {availableYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Mois</InputLabel>
            <Select
              value={selectedMonth}
              label="Mois"
              onChange={e => setSelectedMonth(e.target.value)}
            >
              {months.map(month =>
                <MenuItem key={month.value || "all"} value={month.value}>
                  {month.label}
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={showUrssaf}
                onChange={e => setShowUrssaf(e.target.checked)}
                color="primary"
              />
            }
            label="Mode déclaration"
          />
        </Box>
      </Stack>

      {showUrssaf && (
        <Box mt={3}>
          <UrssafBox data={data} selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="center">
        <Typography variant="body1" fontWeight={600}>Total réservations : <span style={{ color: "#1976d2" }}>{globalStats.totalReservations}</span></Typography>
        <Typography variant="body1" fontWeight={600}>Total nuits réservées : <span style={{ color: "#1976d2" }}>{globalStats.totalNights}</span></Typography>
        <Typography variant="body1" fontWeight={600}>Chiffre d’affaire brut : <span style={{ color: "#388e3c" }}>{globalStats.totalCA.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span></Typography>
      </Stack>

      <Box mt={5} sx={{ maxWidth: "60%", mx: "auto" }}>
        <ProgressBarImpots caBrut={caBrut} caNet={caNet} impot={impot} />
      </Box>
    </Paper>
  );
}

export default Header;
