import { createTheme, alpha } from '@mui/material/styles';

// APBS — AttendeePay Business Suite brand palette
const PRIMARY_MAIN = '#2563EB';
const PRIMARY_DARK = '#1D4ED8';
const SECONDARY_MAIN = '#0EA5E9';
const TEXT_PRIMARY = '#0F172A';
const TEXT_SECONDARY = '#64748B';
const DIVIDER = '#E2E8F0';
const BG_DEFAULT = '#F6F8FB';

const theme = createTheme({
  palette: {
    primary: {
      main: PRIMARY_MAIN,
      dark: PRIMARY_DARK,
      light: '#60A5FA',
    },
    secondary: {
      main: SECONDARY_MAIN,
    },
    background: {
      default: BG_DEFAULT,
      paper: '#FFFFFF',
    },
    text: {
      primary: TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
    },
    divider: DIVIDER,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingLeft: 18,
          paddingRight: 18,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: PRIMARY_DARK,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${DIVIDER}`,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          color: TEXT_PRIMARY,
          boxShadow: 'none',
          borderBottom: `1px solid ${DIVIDER}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: `1px solid ${DIVIDER}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          paddingTop: 6,
          paddingBottom: 6,
          '&:hover': {
            backgroundColor: alpha(PRIMARY_MAIN, 0.06),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(PRIMARY_MAIN, 0.1),
            color: PRIMARY_MAIN,
            '& .MuiListItemIcon-root': {
              color: PRIMARY_MAIN,
            },
            '&:hover': {
              backgroundColor: alpha(PRIMARY_MAIN, 0.14),
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 38,
          color: TEXT_SECONDARY,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: TEXT_SECONDARY,
          backgroundColor: '#F8FAFC',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
