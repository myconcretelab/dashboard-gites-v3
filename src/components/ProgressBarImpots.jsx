// Barre de progression indiquant la part d'impôt sur le CA
import React from 'react';
import { Box, Typography } from '@mui/material';

function ProgressBarImpots({ caBrut, caNet, impot }) {
  // 94 % en vert (net) et 6 % en gris (impôt)
  const percent = caBrut === 0 ? 0 : (caNet / caBrut) * 100;
  return (
    <Box>
      <Box display='flex' alignItems='center' gap={1}>
        <Box sx={{ flex: 1, height: 8, borderRadius: 5, background: '#e0e0e0', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{
            width: `${percent}%`,
            height: 8,
            bgcolor: '#43B77D',
            borderRadius: 5,
            transition: 'width .5s'
          }} />
        </Box>
        <Typography variant='caption' color='#bdbdbd' minWidth={45}>
          6% impôt
        </Typography>
      </Box>
      <Box display='flex' justifyContent='space-between' mt={0.5}>
        <Typography variant='caption' color='#43B77D'>CA net : {caNet.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</Typography>
        <Typography variant='caption' color='#bdbdbd'>Impôt : {impot.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</Typography>
      </Box>
    </Box>
  );
}

export default ProgressBarImpots;
