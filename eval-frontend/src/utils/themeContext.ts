import { createContext } from 'react';
import { PaletteMode } from '@mui/material';

export interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
}); 