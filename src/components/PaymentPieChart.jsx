// Camembert montrant la répartition du chiffre d'affaires par mode de paiement
import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

// Palette de couleurs pour les segments
const COLORS = [
  '#2D8CFF', '#43B77D', '#F5A623', '#7E5BEF', '#FE5C73',
  '#4CC3FA', '#FCBE5E', '#6BCB77', '#FFD700', '#BB86FC'
];

function PaymentPieChart({ payments }) {
  // Conversion de l'objet en tableau et arrondi des valeurs
  const data = Object.entries(payments || {}).map(([name, value]) => ({
    name, value: Math.round(value * 100) / 100
  }));

  if (!data.length) {
    return <div style={{ color: '#bdbdbd', fontSize: 12 }}>Aucun paiement</div>;
  }

  return (
    <ResponsiveContainer width='100%' height={120}>
      <PieChart>
        <Pie
          data={data}
          dataKey='value'
          nameKey='name'
          cx='50%'
          cy='50%'
          innerRadius={28}
          outerRadius={45}
          fill='#8884d8'
          labelLine={false}
          isAnimationActive
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend
          verticalAlign='middle'
          align='right'
          iconType='circle'
          layout='vertical'
          wrapperStyle={{
            fontSize: 12,
            marginLeft: 8,
            top: 15,
            minHeight: 100 // Hauteur minimale pour un affichage correct
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default PaymentPieChart;

