// src/utils/dataUtils.js

function parseGitesData(raw) {
  // Pour chaque gîte, chaque entrée = [nom, debut, fin, mois, nuits, adultes, prix/nuit, revenus, paiement, ...]
  const gites = {};
  Object.keys(raw).forEach(giteName => {
    gites[giteName] = (raw[giteName] || [])
      // On filtre les vraies réservations (certaines lignes sont des totaux ou autres)
      .filter(row => Array.isArray(row) && row.length >= 9 && typeof row[1] === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(row[1]))
      .map(row => ({
        nom: row[0],
        debut: parseDate(row[1]),
        fin: parseDate(row[2]),
        mois: Number(row[3]),
        nuits: safeNum(row[4]),
        adultes: safeNum(row[5]),
        prixNuit: safeNum(row[6]),
        revenus: safeNum(row[7]),
        paiement: (row[8] || "").toString().trim(),
        taxeSejour: 0,
        nuitsTaxe: safeNum(row[5]) * safeNum(row[4])
      }));
  });
  return gites;
}

function isHomeExchange(entry) {
  return (entry.paiement && entry.paiement.trim().toLowerCase() === "homeexchange");
}

function parseDate(d) {
  if (!d) return null;
  // format DD/MM/YYYY
  const [day, month, year] = d.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function safeNum(n) {
  if (n === null || n === undefined) return 0;
  if (typeof n === "number") return n;
  if (typeof n === "string") {
    const num = Number(n.replace(",", ".").replace(/[^0-9.-]/g, ""));
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function getAvailableYears(gites) {
  // Regarde toutes les années présentes dans les données
  const years = new Set();
  Object.values(gites).forEach(arr => arr.forEach(row => {
    if (row.debut) years.add(row.debut.getFullYear());
  }));
  return Array.from(years).sort((a, b) => b - a); // décroissant
}

function filterDataByPeriod(arr, year, month) {
  return arr.filter(entry => {
    if (!entry.debut) return false;
    if (isHomeExchange(entry)) return false; // <-- Ajout
    const y = entry.debut.getFullYear();
    const m = entry.debut.getMonth() + 1;
    if (month) {
      return y === year && m === month;
    }
    return y === year;
  });
}


// Pour les stats globales (header)
function computeGlobalStats(gites, year, month) {
  let totalReservations = 0, totalNights = 0, totalCA = 0;
  Object.values(gites).forEach(arr => {
    const filtered = filterDataByPeriod(arr, year, month);
    totalReservations += filtered.length;
    totalNights += filtered.reduce((sum, e) => sum + (e.nuits || 0), 0);
    totalCA += filtered.reduce((sum, e) => sum + (e.revenus || 0), 0);
  });
  return { totalReservations, totalNights, totalCA };
}

// Pour la fiche gîte : toutes les stats par période
function computeGiteStats(entries, year, month) {
  const filtered = filterDataByPeriod(entries, year, month);
  const reservations = filtered.length;
  const totalNights = filtered.reduce((sum, e) => sum + (e.nuits || 0), 0);
  const totalCA = filtered.reduce((sum, e) => sum + (e.revenus || 0), 0);
  const meanStay = reservations ? (totalNights / reservations) : 0;
  const meanPrice = totalNights ? (totalCA / totalNights) : 0;

  // Répartition paiements (CA)
  const payments = {};
  // Répartition nuitées par groupe de paiement
  const nuiteesByPayment = {
    "Virmnt/Chq": 0,
    "Airbnb": 0,
    "Abritel": 0,
    "Gites de France": 0,
  };

  filtered.forEach(e => {
    const paymentType = e.paiement && e.paiement.trim() ? e.paiement : "Indéfini"; // Si pas de paiement, on le note comme "Indéfini"
    if (!payments[paymentType]) payments[paymentType] = 0; // Initialiser si pas encore fait
    payments[paymentType] += e.revenus || 0; // On additionne les revenus pour chaque type de paiement

    const p = paymentType
      .toLowerCase()
      .replace(/[éèêë]/g, "e")
      .replace(/[àâ]/g, "a");
    const nuitées = (e.nuits || 0) * (e.adultes || 0);
    if (p.includes("airbnb")) {
      nuiteesByPayment["Airbnb"] += nuitées;
    } else if (p.includes("abritel")) {
      nuiteesByPayment["Abritel"] += nuitées;
    } else if (p.includes("gites de france")) {
      nuiteesByPayment["Gites de France"] += nuitées;
    } else if (p.includes("virement") || p.includes("chèque") || p.includes("cheque")) {
      nuiteesByPayment["Virmnt/Chq"] += nuitées;
    }
  });


  return {
    reservations,
    totalNights,
    totalCA,
    meanStay,
    meanPrice,
    payments,
    nuiteesByPayment
  };
}

function computeAverageMetric(entries, selectedYear, selectedMonth, metric) {
  if (!entries || entries.length === 0) return 0;

  const today = new Date();
  const thisYear = today.getFullYear();

  // Toutes les années dispo, sauf l'année sélectionnée
  const years = Array.from(new Set(
    entries.filter(e => e.debut).map(e => e.debut.getFullYear())
  ));
  const otherYears = years.filter(y => y !== selectedYear);

  // Helper pour calculer la valeur selon le metric demandé
  const computeValue = filtered => {
    if (metric === "CA") {
      return filtered.reduce((sum, e) => sum + (e.revenus || 0), 0);
    }
    if (metric === "reservations") {
      return filtered.length;
    }
    if (metric === "nights") {
      return filtered.reduce((sum, e) => sum + (e.nuits || 0), 0);
    }
    if (metric === "price") {
      const totalCA = filtered.reduce((sum, e) => sum + (e.revenus || 0), 0);
      const totalNights = filtered.reduce((sum, e) => sum + (e.nuits || 0), 0);
      return totalNights > 0 ? totalCA / totalNights : null;
    }
    return 0;
  };

  const values = otherYears
    .map(year => {
      let filtered;

      // Si un mois est sélectionné, on compare les mois
      if (selectedMonth) {
        filtered = entries.filter(e =>
          e.debut &&
          e.debut.getFullYear() === year &&
          (e.debut.getMonth() + 1) === Number(selectedMonth)
        );
      } 
      // Si l'année sélectionnée est l'année en cours
      else if (selectedYear === thisYear) {
        const month = today.getMonth();
        const day = today.getDate();
        const start = new Date(year, 0, 1);
        const end = new Date(year, month, day + 1);
        filtered = entries.filter(e =>
          e.debut &&
          e.debut.getFullYear() === year &&
          e.debut >= start &&
          e.debut < end
        );
      } 
      // Si l'année sélectionnée est une année passée
      else {
        // Pour les autres années passées, on prend les 12 mois
        if (year !== thisYear) {
          filtered = entries.filter(e =>
            e.debut &&
            e.debut.getFullYear() === year
          );
        } else {
          // Pour l'année en cours (2025) : on ne prend que les mois déjà passés
          const month = today.getMonth();
          const day = today.getDate();
          const start = new Date(year, 0, 1);
          const end = new Date(year, month, day + 1);
          filtered = entries.filter(e =>
            e.debut &&
            e.debut.getFullYear() === year &&
            e.debut >= start &&
            e.debut < end
          );
        }
      }

      const value = computeValue(filtered);
      return filtered.length > 0 && value !== null ? value : null;
    })
    .filter(v => v !== null);

  const total = values.reduce((sum, v) => sum + v, 0);
  return values.length ? total / values.length : 0;
}


function computeAverageCA(entries, selectedYear, selectedMonth) {
  return computeAverageMetric(entries, selectedYear, selectedMonth, "CA");
}

function computeAverageReservations(entries, selectedYear, selectedMonth) {
  return computeAverageMetric(entries, selectedYear, selectedMonth, "reservations");
}

function computeAverageNights(entries, selectedYear, selectedMonth) {
  return computeAverageMetric(entries, selectedYear, selectedMonth, "nights");
}

function computeAveragePrice(entries, selectedYear, selectedMonth) {
  return computeAverageMetric(entries, selectedYear, selectedMonth, "price");
}




// Pour les jauges d’occupation
function computeOccupation(entries, year, month) {
  const filtered = filterDataByPeriod(entries, year, month);
  let totalNights = filtered.reduce((sum, e) => sum + (e.nuits || 0), 0);

  let daysInPeriod = 0;
  const currentYear = new Date().getFullYear();

  if (month) {
    daysInPeriod = daysInMonth(month, year);
  } else {
    if (year === currentYear) {
      // On prend du 1er janvier à aujourd’hui
      const start = new Date(year, 0, 1);
      const today = new Date();
      // On compte le nombre de jours écoulés depuis le 1er janvier jusqu’à aujourd’hui inclus
      daysInPeriod = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    } else {
      // Année passée ou future complète
      daysInPeriod = isLeapYear(year) ? 366 : 365;
    }
  }

  return daysInPeriod ? totalNights / daysInPeriod : 0;
}


function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}
function isLeapYear(year) {
  return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
}

// Pour les jauges occupation : occuper toutes les années disponibles
function getOccupationPerYear(entries, allYears, selectedMonth) {
  return allYears.map(year => ({
    year,
    occupation: computeOccupation(entries, year, selectedMonth)
  }));
}

// Chiffre d'affaire mensuel global par année
function getMonthlyCAByYear(data) {
  const result = {};
  Object.values(data).forEach(entries => {
    entries.forEach(e => {
      if (!e.debut || isHomeExchange(e)) return;
      const year = e.debut.getFullYear();
      const month = e.debut.getMonth(); // 0-index
      if (!result[year]) {
        result[year] = Array(12).fill(0);
      }
      result[year][month] += e.revenus || 0;
    });
  });

  const formatted = {};
  Object.keys(result).forEach(year => {
    const months = result[year].map((ca, idx) => ({ month: idx + 1, ca }));
    const total = result[year].reduce((sum, v) => sum + v, 0);
    formatted[year] = { months, total };
  });
  return formatted;
}

function getMonthlyCAByGiteForYear(data, year) {
  const result = {};
  Object.entries(data).forEach(([gite, entries]) => {
    entries.forEach(e => {
      if (!e.debut || isHomeExchange(e)) return;
      if (e.debut.getFullYear() !== year) return;
      const month = e.debut.getMonth();
      if (!result[gite]) {
        result[gite] = Array(12).fill(0);
      }
      result[gite][month] += e.revenus || 0;
    });
  });

  const formatted = {};
  Object.keys(result).forEach(gite => {
    const months = result[gite].map((ca, idx) => ({ month: idx + 1, ca }));
    const total = result[gite].reduce((sum, v) => sum + v, 0);
    formatted[gite] = { months, total };
  });
  return formatted;
}

function getMonthlyAverageCA(data) {
  const byYear = getMonthlyCAByYear(data);
  const years = Object.keys(byYear);
  const count = years.length;
  const sums = Array(12).fill(0);
  years.forEach(year => {
    byYear[year].months.forEach((m, idx) => {
      sums[idx] += m.ca;
    });
  });
  return sums.map((sum, idx) => ({ month: idx + 1, ca: count ? sum / count : 0 }));
}

// Pour URSSAF
const URSSAF_PAYMENTS = ["Abritel", "Airbnb", "Chèque", "Virement", "Gites de France"];
function computeUrssaf(data, selectedYear, selectedMonth) {
  // Phonsine, Gree, Edmond = Sébastien
  // Liberté = Soazig
  const namesSeb = ["Phonsine", "Gree", "Edmond"];
  const nameSoazig = "Liberté";
  let urssafSeb = 0;
  namesSeb.forEach(name => {
    (data[name] || []).forEach(e => {
      if (entryMatch(e, selectedYear, selectedMonth) && URSSAF_PAYMENTS.includes(e.paiement)) {
        urssafSeb += e.revenus || 0;
      }
    });
  });
  let urssafSoazig = 0;
  (data[nameSoazig] || []).forEach(e => {
    if (entryMatch(e, selectedYear, selectedMonth) && URSSAF_PAYMENTS.includes(e.paiement)) {
      urssafSoazig += e.revenus || 0;
    }
  });
  return { urssafSeb, urssafSoazig };
}

function computeChequeVirementNights(data, selectedYear, selectedMonth) {
  const result = {};
  Object.keys(data).forEach(name => {
    let nights = 0;
    (data[name] || []).forEach(e => {
      if (entryMatch(e, selectedYear, selectedMonth)) {
        const p = (e.paiement || '')
          .toLowerCase()
          .replace(/[éèêë]/g, 'e')
          .replace(/[àâ]/g, 'a');
        if (p.includes('virement') || p.includes('cheque')) {
          nights += (e.nuits || 0) * (e.adultes || 0);
        }
      }
    });
    result[name] = nights;
  });
  return result;
}
function entryMatch(e, year, month) {
  if (!e.debut) return false;
  const y = e.debut.getFullYear();
  const m = e.debut.getMonth() + 1;
  if (month) return y === year && m === month;
  return y === year;
}

module.exports = {
  parseGitesData,
  getAvailableYears,
  filterDataByPeriod,
  computeGlobalStats,
  computeGiteStats,
  computeAverageCA,
  computeAverageReservations,
  computeAverageNights,
  computeAveragePrice,
  computeOccupation,
  getOccupationPerYear,
  getMonthlyCAByYear,
  getMonthlyCAByGiteForYear,
  getMonthlyAverageCA,
  computeChequeVirementNights,
  computeUrssaf,
  daysInMonth,
  safeNum
};
