import { Stack } from "@mui/material";
import { useState } from "react";
import { numberToBig } from "../../lib/chain/numbers";
import ReadonlyInput from "../../components/ReadonlyInput";
import AssetSelector from "../../components/AssetSelector";
import AmountInput from "../../components/AmountInput";
import NetworkSelector from "../../components/NetworkSelector";
import { EnqueueTransactionButton } from "../transaction-bundler/EnqueueTransactionButton";
import { useUserAccount } from "../../providers/UserAccountProvider";
import { transferERC20Token } from "../../lib/erc20/erc20";
import { useConnectedAddress } from "../../providers/ConnectedAddressProvider";

export default function WithdrawAction({ account, onActionCompleted }){
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [amountIn, setAmountIn] = useState(0);
    const { userAccountBalances } = useUserAccount();
    const { connectedAddress } = useConnectedAddress();

    const canSubmit = selectedNetwork != null && selectedAsset != null && amountIn != null && connectedAddress != null;

    async function makeTransaction(){
        const calldata = await transferERC20Token(connectedAddress, numberToBig(amountIn, selectedAsset.decimals));

        return {
            label: `withdraw ${amountIn} ${selectedAsset.symbol.toUpperCase()}`,
            network: selectedNetwork,
            params: {
                to: selectedAsset.address,
                data: calldata,
                gasLimit: 100000,
                value: 0,
                chainId: selectedNetwork.chainId.toString()
            }
        }
    }

    return (
        <>
            <Stack direction="row" spacing={1}>
                <NetworkSelector 
                    onNetworkChanged={setSelectedNetwork} 
                    sx={{flex: 1}} />

                <AssetSelector 
                    sx={{flex: 1}}
                    selectSx={{marginTop: "0px"}}
                    network={selectedNetwork} 
                    onSelectedAssetChanged={setSelectedAsset} />
            </Stack>

            <ReadonlyInput 
                content={account.eoa} 
                label="From (Managed Wallet)" />

            <ReadonlyInput 
                containerSx={{marginTop: 6}}
                content={connectedAddress} 
                label="To (Owner)" />

            <AmountInput
                containerSx={{marginTop: 6}}
                balances={userAccountBalances}
                asset={selectedAsset}
                network={selectedNetwork}
                onAmountInChanged={setAmountIn} />

            <EnqueueTransactionButton
                onAction={makeTransaction} 
                onActionCompleted={onActionCompleted}
                active={canSubmit}
            />  

        </>
    )
}