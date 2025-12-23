import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from '../theme';
import { ThemeContext } from './themeContext';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
     const storedMode = localStorage.getItem('colorMode') as PaletteMode | null;
     return storedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('colorMode', mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const colorModeValue = useMemo(() => ({ mode, toggleColorMode }), [mode]);
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ThemeContext.Provider value={colorModeValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 