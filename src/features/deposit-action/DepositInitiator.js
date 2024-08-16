import { Box, Button, Input, MenuItem, Select, Stack, Typography } from "@mui/material";
import { getNetworks } from "../../lib/networks/networks";
import { getAccountBalances } from '../../lib/reader/address'; 
import { useEffect, useState } from "react";
import { useAddress, useChainId } from "@thirdweb-dev/react";
import PropTypes from 'prop-types';
import { formatNumber } from '../../lib/format';
import SubmitTransactionButton from "../../components/SubmitTransactionButton";
import { depositERC20 } from "./deposit";
import { numberToBig } from "../../lib/chain/numbers";

const networks = getNetworks();
const captionStyle = {
    pb: "3px",
    color: "#666"
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

const selectStyle = {
    '& .MuiSelect-select': {
        display: 'flex',
        alignItems: 'center',
        textTransform: 'capitalize',
    },
    '& .MuiMenuItem-root': {
        textTransform: 'capitalize',
    },
    width: "100%" 
}

const menuItemStyle = {
    textTransform: "capitalize",
}


function DepositInitiator({ account, fnClose }){
    const [selectedNetworkIndex, setSelectedNetworkIndex] = useState(-1);
    const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
    const [selectedAssetBalance, setSelectedAssetBalance] = useState(0);
    const [amountIn, setAmountIn] = useState("0");
    const [amountInError, setAmountInError] = useState(null)

    const [accountBalancesRefreshCount, setAccountBalancesRefreshCount] = useState(0);
    const [accountBalances, setAccountBalances] = useState({});


    const canSubmit = selectedNetworkIndex != -1 && selectedAssetIndex != -1 && !amountInError && amountIn != "0";
    const selectedNetwork = selectedNetworkIndex == -1 ? { tokens: []} : networks[selectedNetworkIndex];
    const selectedAsset = selectedAssetIndex == -1 || selectedNetworkIndex == -1 ? null : selectedNetwork.tokens[selectedAssetIndex];

    const currentChainId = useChainId();
    const connectedAccount = useAddress();
    
    useEffect(() => {
        if(selectedNetworkIndex != -1)
            return;

        const connectedChainIndex = networks.map(n => { return n.chainId.toString() }).indexOf(currentChainId.toString());

        if(connectedChainIndex != -1){ 
            setSelectedNetworkIndex(connectedChainIndex);
        }
    }, [selectedNetworkIndex])

    useEffect(() => {
        const updateBalances = async () => {
            const balances = await getAccountBalances(networks, connectedAccount);

            setAccountBalances(balances);
        }

        updateBalances();
    }, [accountBalancesRefreshCount])

    useEffect(() => {
        if(!selectedAsset|| selectedNetworkIndex == -1 || !accountBalances[selectedNetwork.chainId]) {
            setSelectedAssetBalance(0);

            return;
        } 

        const balance = accountBalances[selectedNetwork.chainId][selectedAsset.address];
        
        setSelectedAssetBalance(balance ?? 0);

    }, [selectedAsset, accountBalances])

    function setSelectedNetwork(index){
        setSelectedNetworkIndex(index);
        setSelectedAssetIndex(0);
        setAmountIn(0);
    }

    function setSelectedAsset(index){
        setSelectedAssetIndex(index);
        setAmountIn(0);
    }

    function setAmount(amount){
        setAmountIn(amount);

        let error = null;

        if(isNaN(amount)){
            error = "invalid input amount";
        } else if(amount > selectedAssetBalance){
            error = "amount exceeds balance";
        }

        setAmountInError(error);
    }

    async function submitTransaction(signer){
        const amount = numberToBig(Number(amountIn), selectedAsset.decimals);

        return depositERC20(signer, account.eoa, selectedAsset.address, amount);
    }

    function onSubmitTransactionCallback(){
        fnClose();
    }
    
    return (
        <>
            <Box>
                <Typography variant="caption" display="block" sx={captionStyle}>Network</Typography>
                <Select sx={selectStyle}
                    value={selectedNetworkIndex} 
                    onChange={(e) => { setSelectedNetwork(e.target.value) }}>

                    { networks.map((network, index) => (
                        <MenuItem value={index} sx={menuItemStyle}>
                            <img src={network.icon} height="25px" width="25px" />&nbsp;{network.name}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            <Box sx={{marginTop: 2}}>
                <Typography variant="caption" display="block" sx={captionStyle}>To (Managed Wallet)</Typography>
                <Typography variant="body2" display="block" sx={{
                    textAlign: "right",
                    backgroundColor: "hsla(220, 35%, 94%, 0.4)",
                    border: "1px solid hsla(220, 25%, 80%, 0.8)",
                    padding: "10px",
                    borderRadius: 1,
                    color: "#444"
                }}>{account.eoa}</Typography>
            </Box>

            <Box sx={{marginTop: 2}}>
                <Typography variant="caption" display="block" sx={captionStyle}>Asset</Typography>
                <Select sx={selectStyle}
                    value={selectedAssetIndex} 
                    onChange={(e) => { setSelectedAsset(e.target.value) }}>

                    { selectedNetwork.tokens.map((token, index) => (
                        <MenuItem value={index} sx={menuItemStyle}>
                            <img src={token.image} height="25px" width="25px" />&nbsp;{token.name}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            <Box sx={{marginTop: 2}}>
                <Typography variant="caption" display="block" sx={captionStyle}>Amount</Typography>

                <Input type="text" 
                    sx={rightAlignedInputStyle(amountInError != null)} 
                    value={amountIn}
                    onChange={ (e) => setAmount(e.target.value) }  />

                <Stack direction="row" sx={{ 
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}>
                    <Typography variant="caption" sx={{
                        ...captionStyle,
                        flexGrow: 1, 
                        textAlign: 'left',
                        color: "red"
                    }}>
                        {amountInError}
                    </Typography>
                    <Typography variant="caption" sx={{
                        ...captionStyle,
                        display: "flex",
                        alignItems: 'center'
                    }}>
                        Balance:&nbsp;{ formatNumber(selectedAssetBalance) }
                    </Typography>

                    <Typography variant="caption" sx={{
                            ...captionStyle,
                            display: "flex",
                            color: "blue",
                            cursor: "pointer",
                            alignItems: 'center'
                        }} 
                        onClick={ () => { setAmount(selectedAssetBalance) } }
                    >
                        &nbsp;(max)
                    </Typography>
                </Stack>
                
            </Box>
            
            <Box sx={{marginTop: 6}}>

                <SubmitTransactionButton 
                    chainId={selectedNetwork.chainId}
                    disabled={!canSubmit} 
                    label="Deposit Assets" 
                    onSubmitTransaction={submitTransaction} 
                    callback={onSubmitTransactionCallback}
                    waitForConfirmation={true} />

                <Button variant="outlined" sx={{width: "100%", marginTop: 2}} onClick={fnClose}>Cancel</Button>
            </Box>
        </>
    )
}

DepositInitiator.propTypes = {
    fnClose: PropTypes.PropTypes.func.isRequired,
    account: PropTypes.PropTypes.object.isRequired,
};

export default DepositInitiator