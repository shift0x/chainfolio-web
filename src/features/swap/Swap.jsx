import { Box, Paper, Stack, Typography } from "@mui/material";
import NetworkSelector from "../../components/NetworkSelector";
import { useEffect, useMemo, useState } from "react";
import AssetSelector from "../../components/AssetSelector";
import AmountInput from "../../components/AmountInput";
import { useUserAccount } from "../../providers/UserAccountProvider";
import ReadonlyInput from "../../components/ReadonlyInput";
import DividerWithIcon from "../../components/DividerWithIcon";
import { EnqueueTransactionButton } from "../transaction-bundler/EnqueueTransactionButton";
import { priceSwap, quoteSwap } from "./zerox";
import { getERC20TokenAllowance, makeERC20TokenApproveCalldata } from "../../lib/erc20/erc20";
import { formatNumber } from "../../lib/format";

const swapContainerStyle = {
    width: "450px",
    padding: 3,
    backgroundColor: "#fcfcfc",
    margin: "auto"
}

const flexbox = {
    display: "inline-flex",
    width: "50%"
}

export default function Swap({sx={}, ...props}){
    const { userAccount, userAccountBalances } = useUserAccount();
    const [ selectedNetwork, setSelectedNetwork ] = useState(null)
    const [ fromAsset, setSelectedFromAsset ] = useState(null)
    const [ toAsset, setSelectedToAsset ] = useState(null);
    const [ fromAmount, setFromAmount ] = useState(null)
    const [ estimatedAmountOut, setEstimatedAmountOut ] = useState(null)

    const canPrice = useMemo(() => {
        if(!selectedNetwork || !fromAsset || !toAsset || !fromAmount) { 
            return false; 
        }

        if(fromAsset.symbol == toAsset.symbol){
            return false;
        }

        return true;
    })

    const canSubmit = useMemo(() => {
        return canPrice && estimatedAmountOut != null
    });

    const params = useMemo(() => {
        if(!canPrice){
            return null
        }

        return [selectedNetwork.name, fromAsset.symbol, toAsset.symbol, fromAmount].join("_")
    })

    const price = async () => {
        const priceResult = await priceSwap(fromAsset, toAsset, fromAmount, selectedNetwork.chainId);

        if(!priceResult || priceResult.error != null){
            setEstimatedAmountOut(null)
        } else {
            setEstimatedAmountOut(priceResult.amountOut);
        }
    }

    useEffect(() => {
        if(!canPrice){
            setEstimatedAmountOut(null);

            return
        }

        price();
    }, [params])


    const makeTransaction = async () => {
        const zeroXParams = await quoteSwap(fromAsset, toAsset, fromAmount, selectedNetwork.chainId);
        const allowance = await getERC20TokenAllowance(selectedNetwork.chainId, 
            userAccount.eoa, 
            zeroXParams.data.allowanceTarget, 
            fromAsset.address, 
            fromAsset.decimals);

        const txs = [];

        if(allowance < fromAmount){
            const approveCalldata = await makeERC20TokenApproveCalldata(zeroXParams.data.allowanceTarget);
            
            txs.push(
                {
                    label: "approve 0x router",
                    network: selectedNetwork,
                    params: {
                        to: fromAsset.address,
                        data: approveCalldata,
                        gasLimit: 300000,
                        value: 0,
                        chainId: selectedNetwork.chainId.toString()
                    }
                }
            )
        }

        txs.push({
            label: `swap ${formatNumber(fromAmount)} ${fromAsset.symbol.toUpperCase()} to ${toAsset.symbol.toUpperCase()}`,
            network: selectedNetwork,
            params: {
                to: zeroXParams.data.to,
                data: zeroXParams.data.data,
                gasLimit: Number(zeroXParams.data.gas) * 2,
                value: zeroXParams.data.value,
                chainId: selectedNetwork.chainId.toString()
            }
        })

        return txs
    }

    return (
        <Box>
            <Paper sx={{
                ...swapContainerStyle,
                ...sx
            }} {...props}>

                <Typography variant="caption" sx={{ color: "#888"}}>Account: {userAccount.eoa}</Typography>

                <NetworkSelector onNetworkChanged={setSelectedNetwork} sx={{mt: 2}} />

                <Stack direction="row" spacing={1} sx={{mt: 2}}>
                    <Box sx={{...flexbox, pr:2}}>
                        <AssetSelector sx={{width: "100%", marginTop: 0}}
                            caption="From Asset" 
                            onSelectedAssetChanged={setSelectedFromAsset} 
                            network={selectedNetwork}  />
                    </Box>

                    <Box sx={{ ...flexbox, pl: 2}}>
                        <AmountInput containerSx={{width: "100%", marginTop: 0}}
                            checkForInsuffientInput={false}
                            caption="From Amount" 
                            onAmountInChanged={setFromAmount} 
                            network={selectedNetwork} 
                            asset={fromAsset}
                            balances={userAccountBalances} />
                    </Box>
                </Stack>

                <DividerWithIcon sx={{mt: 2, mb:2}} />

                <Stack direction="row" spacing={1} sx={{mt: 2}}>
                    <Box sx={{...flexbox, pr:2}}>
                        <AssetSelector sx={{width: "100%", marginTop: 0}}
                            caption="To Asset" 
                            onSelectedAssetChanged={setSelectedToAsset} 
                            network={selectedNetwork}  />
                    </Box>

                    <Box sx={{ ...flexbox, pl: 2}}>
                        <ReadonlyInput  containerSx={{mt: 0, width: "100%"}}
                            label="Estimated Output" 
                            content={estimatedAmountOut} />
                    </Box>
                </Stack>

                <EnqueueTransactionButton 
                    sx={{mt: 4}}
                    onAction={makeTransaction} 
                    active={canSubmit}
                />
            </Paper>
        </Box>
       
    )
}