import { createTheme } from "@mui/material/styles";

export const workforceCliffTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1B3A4B",
      light: "#2D5A6E",
      dark: "#0F2430",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#D97855",
      light: "#E8A080",
      dark: "#B85A3A",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F7F8FA",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#4a5568",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.01em" },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
        },
      },
    },
  },
});
