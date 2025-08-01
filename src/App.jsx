import React, { useEffect, useState } from "react";
import { Container, Grid, CssBaseline, CircularProgress, Box, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Header from "./components/Header";
import GiteCard from "./components/GiteCard";
import { parseGitesData, getAvailableYears, filterDataByPeriod, computeGlobalStats } from "./utils/dataUtils";
import "./index.css";
import DebugCA from "./components/DebugCA";
import GlobalRevenueChart from "./components/GlobalRevenueChart";

const GITE_NAMES = ["Phonsine", "Gree", "Edmond", "Liberté"];
const PASSWORD = "tellthem"; // ← Change-le si tu veux

function App() {
  // >>>>>> Place ici la logique d'authentification <<<<<<
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("gites-authenticated") === "true") {
      setAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === PASSWORD) {
      setAuthenticated(true);
      localStorage.setItem("gites-authenticated", "true");
      setError("");
    } else {
      setError("Mot de passe incorrect.");
    }
  };

  // >>>>>> FIN logique d'authentification <<<<<<

  const [rawData, setRawData] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  // Sélection année/mois
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null); // null = année entière

  // Sélection gîte ou année pour les graphiques globaux
  const [selectedItem, setSelectedItem] = useState("Tous");

  // Switch URSSAF
  const [showUrssaf, setShowUrssaf] = useState(false);
  // Switch Stats
  const [showStats, setShowStats] = useState(false);

  // Gestion années disponibles
  const [availableYears, setAvailableYears] = useState([]);

  // Récupération des données depuis l'API
  useEffect(() => {
    setLoading(true);
    fetch(process.env.REACT_APP_GITES_API) // Assure-toi que l'URL de l'API est définie dans .env
      .then(res => res.json()) // Utilise .json() pour parser la réponse
      .then(json => {
        setRawData(json);
        const parsed = parseGitesData(json);
        setData(parsed);
        setAvailableYears(getAvailableYears(parsed));
        setLoading(false);
      });
  }, []);

  // Statistiques globales (header)
  const globalStats = rawData
    ? computeGlobalStats(data, selectedYear, selectedMonth)
    : { totalReservations: 0, totalNights: 0, totalCA: 0 };

  // ---------- AFFICHAGE FORMULAIRE MOT DE PASSE SI BESOIN ----------
  if (!authenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fa"
      }}>
        <form onSubmit={handlePasswordSubmit}
              style={{
                background: "#fff",
                padding: 32,
                borderRadius: 12,
                boxShadow: "0 4px 24px #ddd",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 280
              }}>
          <h2 style={{ marginBottom: 16 }}>Accès protégé</h2>
          <input
            type="password"
            placeholder="Mot de passe…"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            style={{
              padding: 10, fontSize: 18, borderRadius: 5, border: "1px solid #ccc", marginBottom: 12, width: "100%"
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 22px",
              fontSize: 17,
              borderRadius: 5,
              border: "none",
              background: "#2D8CFF",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Entrer
          </button>
          {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
        </form>
      </div>
    );
  }
  // ---------- FIN FORMULAIRE MOT DE PASSE ----------

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="#f5f7fa">
        <CircularProgress color="primary" />
        <Typography variant="h5" mt={3} mb={2} fontWeight={600}>Les Gîtes de Brocéliande</Typography>
        <Box width={200}><div className="progress-bar"></div></Box>
      </Box>
    );
  }

  const isYearSelection = typeof selectedItem === "number";
  const chartData = isYearSelection
    ? data
    : selectedItem === "Tous"
      ? data
      : { [selectedItem]: data[selectedItem] || [] };
  const labelsForChart = isYearSelection ? GITE_NAMES : getAvailableYears(chartData);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Header
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          availableYears={availableYears}
          showUrssaf={showUrssaf}
          setShowUrssaf={setShowUrssaf}
          showStats={showStats}
          setShowStats={setShowStats}
          data={data}
          globalStats={globalStats}
        />

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {GITE_NAMES.map(name => (
            <Grid key={name} item xs={12} sm={6}>
              <GiteCard
                name={name}
                data={data[name] || []}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                availableYears={availableYears}
                showUrssaf={showUrssaf}
                showStats={showStats}
              />
            </Grid>
          ))}
        </Grid>
        <FormControl fullWidth sx={{ mt: 4 }}>
          <InputLabel id="gite-select-label">Gîte ou année</InputLabel>
          <Select
            labelId="gite-select-label"
            value={selectedItem}
            label="Gîte ou année"
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            <MenuItem value="Tous">Tous les gîtes</MenuItem>
            {GITE_NAMES.map(name => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
            {availableYears.map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <GlobalRevenueChart data={chartData} labels={labelsForChart} selectedOption={selectedItem} />
      </Container>
     {/*  <DebugCA data={data["Edmond"] || []} /> Composant de debug pour les données d'Edmond */}
    </>
  );
}

export default App;
