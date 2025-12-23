// src/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { teal, amber } from '@mui/material/colors';

const commonSettings: ThemeOptions = {
  typography: {
    fontFamily: 'IBM Plex Sans, sans-serif',
  },
};

export const lightTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: 'light',
    primary: {
      main: '#295851',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgb(13, 65, 8)',
    },
  },
});

export const darkTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: 'dark',

    primary: {
      main: teal[300],   // #4DB6AC
    },

    secondary: {
      main: amber[300],  // #FFD54F
    },

    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },

    text: {
      primary: 'rgba(255,255,255,0.87)',
      secondary: 'rgba(255,255,255,0.60)',
    },

    divider: 'rgba(255,255,255,0.12)',

    action: {
      hover: 'rgba(255,255,255,0.04)',
      selected: 'rgba(255,255,255,0.08)',
    },
  },
});