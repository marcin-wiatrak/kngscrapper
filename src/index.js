import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {ThemeProvider} from "@mui/material";
import {createTheme} from '@mui/material/styles'

const theme = createTheme({
    components: {
        MuiPaper: {
            defaultProps: {
                elevation: 5,
            },
            styleOverrides: {
                rounded: '20',
                root: {
                    borderRadius: 10,
                    padding: 12,
                },
            },
        }
    },
    shadows: {
        5: "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
    },
})

ReactDOM.render(
  <React.StrictMode>
      <ThemeProvider theme={theme}>
          <App />
      </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
