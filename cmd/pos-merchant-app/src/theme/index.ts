import { createTheme, ThemeOptions } from '@mui/material/styles';

// 基本調色板
const palette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
  },
  secondary: {
    main: '#dc004e',
    light: '#ff6584',
    dark: '#9a0036',
  },
};

// 亮色主題
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    ...palette,
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
};

// 暗色主題
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    ...palette,
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: lightThemeOptions.typography,
  components: lightThemeOptions.components,
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
