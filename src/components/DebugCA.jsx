import React from "react";

function DebugCA({ data }) {
  // data = tableau d'entrées (ex: data['Edmond'])
  const year = 2025;
  const filtered = data.filter(entry =>
    entry.debut && entry.debut.getFullYear() === year
  );
  const totalCA = filtered.reduce((sum, e) => sum + (e.revenus || 0), 0);

  return (
    <div style={{ background: "#fff", border: "1px solid #ddd", margin: 20, padding: 10, borderRadius: 8 }}>
      <h3>Debug Edmond 2025</h3>
      <ul>
        {filtered.map((e, i) => (
          <li key={i}>
            <b>{e.nom}</b> du {e.debut?.toLocaleDateString()} au {e.fin?.toLocaleDateString()} : <b>{e.revenus}</b> €
          </li>
        ))}
      </ul>
      <div><b>Total calculé : {totalCA} €</b></div>
    </div>
  );
}

export default DebugCA;
