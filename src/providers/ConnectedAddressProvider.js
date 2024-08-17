import { useAddress } from "@thirdweb-dev/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getNetworks } from "../lib/networks/networks";
import { getAccountBalances } from "../lib/reader/address";

const ConnectedAddressContext = createContext(null);
const networks = getNetworks()

export const useConnectedAddress = () => {
    const context = useContext(ConnectedAddressContext);

    return context;
}

export const ConnectedAddressProvider = ({children}) => {
    const [connectedAddressBalances, setConnectedAddressBalances] = useState(null);

    const connectedUserAddress = useAddress();
    
    const updateConnectedAddressBalances = async () => {
        const balances = await getAccountBalances(networks, connectedAddress)

        setConnectedAddressBalances(balances);
    }

    const connectedAddress = useMemo(() => { return connectedUserAddress });

    useEffect(() => {
        if(!connectedAddress){
            setConnectedAddressBalances(null)
        } else {
            updateConnectedAddressBalances();
        }
    }, [connectedAddress])

    const value = {
        connectedAddress, 
        connectedAddressBalances, 
        updateConnectedAddressBalances
    }

    return (
        <ConnectedAddressContext.Provider value={value}>
            {children}
        </ConnectedAddressContext.Provider>
    )
}