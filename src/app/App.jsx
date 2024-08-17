import './App.css';

import ThemeOptions from './theme';
import { Container, CssBaseline, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { Outlet } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { UserAccountProvider } from '../providers/UserAccountProvider';
import { ConnectedAddressProvider } from '../providers/ConnectedAddressProvider';
import { TransactionQueueProvider} from '../providers/TransactionQueueProvider';

const lightTheme = createTheme(ThemeOptions("light"))

function App() {
  

  return (
    <ThemeProvider theme={lightTheme}>
      <ConnectedAddressProvider>
        <UserAccountProvider>
          <TransactionQueueProvider>
            <Container>
              <CssBaseline />
              <AppHeader />
              <Container sx={{ pt: 20}}>
                <Outlet />
              </Container>
            </Container>
          </TransactionQueueProvider>
        </UserAccountProvider>
      </ConnectedAddressProvider>
    </ThemeProvider>
  );
}

export default App;
