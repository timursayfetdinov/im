import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';

import { Providers } from '@/app/providers';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CssBaseline />
    <GlobalStyles
      styles={{ html: { height: '100%' }, body: { height: '100%' }, '#root': { height: '100%' } }}
    />
    <Providers />
  </StrictMode>
);
