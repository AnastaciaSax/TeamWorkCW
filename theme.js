import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#d4a971',
      contrastText: '#1f4d3a',
    },
    secondary: {
      main: '#30a17b',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    // Основной шрифт для всего текста
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
    // Заголовки используют Montserrat Alternates
    h1: {
      fontFamily: '"Montserrat Alternates", "Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: '"Montserrat Alternates", "Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Montserrat Alternates", "Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Montserrat Alternates", "Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Montserrat Alternates", "Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Montserrat Alternates", "Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    button: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
      textTransform: 'none', // отключаем автоматический капс у кнопок (по желанию)
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;