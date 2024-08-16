import { StyledCaption } from "./StyledCaption"
import { Box, Input, Stack } from "@mui/material"
import { formatNumber } from "../lib/format"
import { useEffect, useState } from "react"
import { getAccountBalances } from "../lib/reader/address"
import { useAddress } from "@thirdweb-dev/react"
import { getNetworks } from "../lib/networks/networks"

const inputErrorStyle = {
    flexGrow: 1, 
    textAlign: 'left',
    color: "red"
}

const accountBalanceStyle = {
    display: "flex",
    alignItems: 'center'
}

const maxAmountInStyle = {
    display: "flex",
    color: "blue",
    cursor: "pointer",
    alignItems: 'center'
}

const defaultContainerStyle = {
    marginTop: 2
}

const rightAlignedInputStyle = (error) => {
    return {
        width: "100%", 
        '& .MuiInput-input': {
            textAlign: "right"
        },
        borderBottom: error ? "1px solid red" : "border bottom 1px solid #000"
    }
} 

const networks = getNetworks();

export default function AmountInput({ asset, network, onAmountInChanged, containerSx = {}, inputSx = {} }){
    const [selectedAssetBalance, setSelectedAssetBalance] = useState(0);
    const [inputAmountIn, setInputAmountIn] = useState("");
    const [amountInError, setAmountInError] = useState(null);
    const [accountBalances, setAccountBalances] = useState({});
    const [accountBalancesRefreshCount, setAccountBalancesRefreshCount] = useState(0);

    const connectedAccount = useAddress();

    function setAccountMaximumInput(){
        if(!asset|| !network || !accountBalances[network.chainId]) {
            setSelectedAssetBalance("");

            return;
        } 

        const balance = accountBalances[network.chainId][asset.address];
        
        setSelectedAssetBalance(balance ?? "");
    }

    useEffect(() => {
        const updateBalances = async () => {
            const balances = await getAccountBalances(networks, connectedAccount);

            setAccountBalances(balances);
            setAccountMaximumInput();
        }

        updateBalances();
    }, [accountBalancesRefreshCount])

    useEffect(() => {
        setAccountMaximumInput();
        setAmount(0)
    }, [asset, network])

    function setAmount(amount){
        setInputAmountIn(amount);

        let error = null;

        if(isNaN(amount)){
            error = "invalid input amount";
        } else if(amount > selectedAssetBalance){
            error = "amount exceeds balance";
        } else if(amount < 0){
            error = "amount must be > 0"
        }
        
        if(error || amount == 0){
            onAmountInChanged(null);
        } else {
            onAmountInChanged(amount);
        }

        setAmountInError(error);
    }

    return (
        <Box sx={{
            ...defaultContainerStyle,
            ...containerSx
        }}>
            <StyledCaption>Amount</StyledCaption>

            <Input type="text" 
                sx={{
                    ...rightAlignedInputStyle(amountInError != null),
                    ...inputSx
                }} 
                value={inputAmountIn}
                onChange={ (e) => setAmount(e.target.value) }  />

            <Stack direction="row" sx={{ 
                justifyContent: 'flex-end',
                alignItems: 'center'
            }}>
                <StyledCaption 
                    sx={inputErrorStyle}>
                        {amountInError}
                </StyledCaption>
                
                <StyledCaption 
                    sx={accountBalanceStyle}>
                        Balance:&nbsp;{ formatNumber(selectedAssetBalance) }
                </StyledCaption>
                
                <StyledCaption 
                    sx={maxAmountInStyle} 
                    onClick={ () => { setAmount(selectedAssetBalance)}}>
                        &nbsp;(max)
                </StyledCaption>
            </Stack>
        </Box>
    )
}