import './App.css';

import ThemeOptions from './theme';
import { Container, CssBaseline, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { Outlet } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { useEffect, useMemo, useState } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import { useAccountManager } from '../lib/account-manager/accountManager';
import UserAccountContext from '../context/UserAccountContext';
import ConnectedAddressContext from '../context/ConnectedAddressContext';
import { getNetworks } from '../lib/networks/networks';
import { getAccountBalances } from '../lib/reader/address';

const lightTheme = createTheme(ThemeOptions("light"))
const networks = getNetworks();

function App() {
  const accountManager = useAccountManager();
  const connectedAddress = useAddress();

  const [userAccount, setUserAccount] = useState(null);
  const [userAccountBalances, setUserAccountBalances] = useState(null);
  const [connectedAddressBalances, setConnectedAddressBalances] = useState(null);

  const updateUserAccount = async () => {
    const account = await accountManager.getAccount(connectedAddress);
    const balances = account != null ? await getAccountBalances(networks, account.eoa) : null;

    setUserAccount(account);
    setUserAccountBalances(balances);
  }

  const updateConnectedAddressBalances = async () => {
    const balances = await getAccountBalances(networks, connectedAddress)

    setConnectedAddressBalances(balances);
  }

  const connectedUserAddress = useMemo(() => { return connectedAddress });

  useEffect(() => {
    if (!connectedAddress){
        setUserAccount(null);
        setUserAccountBalances(null);

        return
    }

    updateConnectedAddressBalances();
    updateUserAccount();
  }, [connectedUserAddress])

  return (
    <ThemeProvider theme={lightTheme}>
      <UserAccountContext.Provider value={{ userAccount, userAccountBalances, updateUserAccount }}>
        <ConnectedAddressContext.Provider value={{ connectedAddress, connectedAddressBalances, updateConnectedAddressBalances}}>
          <Container>
            <CssBaseline />
            <AppHeader />
            <Container sx={{ pt: 20}}>
              <Outlet />
            </Container>
          </Container>
        </ConnectedAddressContext.Provider>
      </UserAccountContext.Provider>
    </ThemeProvider>
  );
}

export default App;
