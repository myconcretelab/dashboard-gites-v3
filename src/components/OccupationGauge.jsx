// Affiche des jauges de taux d'occupation ou de CA par année
import React from 'react';
import GaugeChart from 'react-gauge-chart';
import { Box, Stack, Typography } from '@mui/material';
import { color } from 'chart.js/helpers';

// ---- VARIABLES DE COULEURS (modifiable ici ou importer depuis theme.js) ----
const GAUGE_MAIN_COLOR      = "#ce1273ff";    // Couleur de la jauge sélectionnée
const GAUGE_BG_COLOR        = "#d21d62ff";    // Couleur fond jauge sélectionnée
const GAUGE_NEUTRAL_COLOR   = "#d2d2d2";    // Jauges grises (autres années)
const GAUGE_NEUTRAL_BG      = "#f7f7f7";    // Jauge grise (fond)
const NEEDLE_COLOR          = "#bdbdbd";    // Aiguille
const YEAR_SELECTED_COLOR   = "#c9119bff";    // Texte année sélectionnée
const YEAR_DEFAULT_COLOR    = "#bdbdbd";    // Texte autres années
const PERCENT_COLOR         = "#757575";    // Couleur du %
const FONT_WEIGHT_SELECTED  = 700;
const FONT_WEIGHT_DEFAULT   = 400;
// ---------------------------------------------------------------------------

function OccupationGauge({ occupations, selectedYear, selectedMonth, showCA, caByYear, maxCA }) {
  return (
    <Stack direction='row' gap={2} alignItems='flex-end' justifyContent='center' flexWrap='wrap'>
      {occupations.map(({ year, occupation }) => (
        <Box key={year} align='center' sx={{ minWidth: 80 }}>
          <GaugeChart
            id={`gauge-${year}-${showCA ? 'CA' : 'occ'}`}
            nrOfLevels={10}
            percent={
              showCA
                ? (maxCA ? (caByYear[year] || 0) / maxCA : 0)
                : (occupation > 1 ? 1 : occupation)
            }
            colors={
              year === selectedYear
                ? ['#d81060ff', '#d71163ff']
                : ['#d2d2d2', '#f7f7f7']
            }
            arcWidth={0.23}
            hideText
            needleColor='#2f2b2bff'
            style={{ width: 60, height: 27}}
          />
          <Typography
            variant='caption'
            sx={{
              color: year === selectedYear ? '#d71163ff' : '#bdbdbd',
              fontWeight: year === selectedYear ? 700 : 400
            }}
          >
            {year}
          </Typography>&nbsp;-&nbsp;
          <Typography variant='caption' sx={{ color: year === selectedYear ? '#d71163ff' : '#bdbdbd', fontSize: 11 }}>
            {showCA
              ? (caByYear[year] || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
              : `${Math.round((occupation || 0) * 100)}%`}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}


export default OccupationGauge;

