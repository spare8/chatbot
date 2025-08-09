// lib/theme.js
import {createTheme} from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {default: '#121212', paper: '#1d1d1d'},
    primary: {main: '#90caf9'},
  },
});
