// src/theme/theme.js
import { createTheme } from '@mui/material/styles';
 
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#27235C', dark: '#1B193F', contrastText: '#fff' },
    secondary: { main: '#97247E', light: '#AC5098', contrastText: '#fff' },
    error: { main: '#E01950' },
    warning: { main: '#E2B93B' },
    success: { main: '#24A148' },
    background: { default: '#F4F5F9', paper: '#FFFFFF' },
    text: { primary: '#1B193F', secondary: '#6B7280' },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: { fontWeight: 700, fontSize: '2rem' },
    h2: { fontWeight: 700, fontSize: '1.5rem' },
    h3: { fontWeight: 600, fontSize: '1.25rem' },
    h4: { fontWeight: 600, fontSize: '1.1rem' },
    h5: { fontWeight: 600, fontSize: '1rem' },
    h6: { fontWeight: 600, fontSize: '0.9rem' },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8rem' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
  },
  shape: { borderRadius: 10 },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          ':disabled':{color:'#e8e5e5db '}
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #1B193F 0%, #7a1d68 100%)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          border: '1px solid #F0F0F5',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F8F8FC',
            fontWeight: 700,
            color: '#27235C',
            fontSize: '0.78rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F0F0F5',
          padding: '10px 16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6, fontWeight: 600, fontSize: '0.75rem' } },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
      },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { borderRadius: 6, fontSize: '0.75rem' } },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 4, height: 6 } },
    },
  },
});
 
export default theme;