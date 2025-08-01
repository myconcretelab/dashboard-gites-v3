// Encadré récapitulatif des montants URSSAF et nuitées par gîte
import React from 'react';
import { Paper, Typography, Stack } from '@mui/material';
import { computeUrssaf, computeChequeVirementNights } from '../utils/dataUtils';

function UrssafBox({ data, selectedYear, selectedMonth }) {
  const { urssafSeb, urssafSoazig } = computeUrssaf(data, selectedYear, selectedMonth);
  const nightsByGite = computeChequeVirementNights(data, selectedYear, selectedMonth);
  const gites = ['Phonsine', 'Gree', 'Edmond', 'Liberté'];
  return (
    <Paper elevation={0} sx={{ bgcolor: '#f7f8fa', borderRadius: 3, p: 2, mb: 1, border: '1px solid #e0e0e0' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems='center' justifyContent='center'>
        <Typography>
          <span style={{ fontWeight: 700, color: '#2D8CFF' }}>URSSAF Sébastien : </span>
          <span style={{ fontWeight: 500 }}>
            {urssafSeb.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
        </Typography>
        <Typography>
          <span style={{ fontWeight: 700, color: '#43B77D' }}>URSSAF Soazig : </span>
          <span style={{ fontWeight: 500 }}>
            {urssafSoazig.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
        </Typography>
      </Stack>
      <Stack direction='row' spacing={2} justifyContent='center' mt={1}>
        {gites.map(name => (
          <Stack key={name} spacing={0.5} alignItems='center'>
            <Typography variant='caption' fontWeight={700}>{name}</Typography>
            <Typography variant='caption'>{nightsByGite[name] || 0} nuitées</Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

export default UrssafBox;
