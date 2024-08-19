import { createContext, useContext, useEffect, useState } from "react"
import { useAccountManager } from "../lib/account-manager/accountManager";
import { useConnectedAddress } from "./ConnectedAddressProvider";
import { getAccountBalances } from "../lib/reader/address";
import { useNetworks } from "./NetworksProvider";

const UserAccountContext = createContext(null);

export const useUserAccount = () => {
    const context = useContext(UserAccountContext);

    return context
}

export const UserAccountProvider = ({children}) => {
    const [userAccount, setUserAccount] = useState(null);
    const [userAccountBalances, setUserAccountBalances] = useState(null);
    const { connectedAddress } = useConnectedAddress();
    const { networks } = useNetworks();

    const accountManager = useAccountManager();

    const updateUserAccount = async () => {
        const account = await accountManager.getAccount(connectedAddress);
        const balances = account != null ? await getAccountBalances(networks, account.eoa) : null;

        setUserAccount(account);
        setUserAccountBalances(balances);
    }

    useEffect(() => {
        if (!connectedAddress){
            setUserAccount(null);
            setUserAccountBalances(null);

            return
        }

        updateUserAccount();
    }, [connectedAddress])


    const value = {
        userAccount,
        userAccountBalances,
        updateUserAccount
    }

    return (
        <UserAccountContext.Provider value={value}>
            {children}
        </UserAccountContext.Provider>
    )
}
