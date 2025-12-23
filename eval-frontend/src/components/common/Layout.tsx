import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Header from './Header';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Toolbar sx={{ minHeight: { xs: 96, sm: 64 } }} />
      <Box component="main" sx={{ flex: 1, overflow: 'auto', px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
