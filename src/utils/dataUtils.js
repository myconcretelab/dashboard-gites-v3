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
        taxeSejour: safeNum(row[9]),
        nuitsTaxe: safeNum(row[10]),
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
    "Virement / chèque": 0,
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
      nuiteesByPayment["Virement / chèque"] += nuitées;
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
  computeOccupation,
  getOccupationPerYear,
  computeUrssaf,
  daysInMonth,
  safeNum
};
