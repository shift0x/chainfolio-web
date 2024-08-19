import { useAddress } from "@thirdweb-dev/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAccountBalances } from "../lib/reader/address";
import { useNetworks } from "./NetworksProvider";

const ConnectedAddressContext = createContext(null);

export const useConnectedAddress = () => {
    const context = useContext(ConnectedAddressContext);

    return context;
}

export const ConnectedAddressProvider = ({children}) => {
    const [connectedAddressBalances, setConnectedAddressBalances] = useState(null);
    const { networks } = useNetworks();

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