import { Stack } from "@mui/material";
import { useContext, useState } from "react";
import { numberToBig } from "../../lib/chain/numbers";
import ReadonlyInput from "../../components/ReadonlyInput";
import AssetSelector from "../../components/AssetSelector";
import AmountInput from "../../components/AmountInput";
import NetworkSelector from "../../components/NetworkSelector";
import EvmAddressInput from "../../components/EvmAddressInput";
import { EnqueueTransactionButton } from "../../components/ActionButton";
import { useUserAccount } from "../../providers/UserAccountProvider";
import { transferERC20Token } from "../../lib/erc20/erc20";

export default function TransferAction({ account, onNewTransaction, onActionCompleted }){
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [destinationAddress, setDestinationAddress] = useState(null);
    const [amountIn, setAmountIn] = useState(0);
    const { userAccountBalances } = useUserAccount();
    
    const canSubmit = selectedNetwork != null && selectedAsset != null && amountIn != null && destinationAddress != null;

    async function makeTransaction(){
        const calldata = await transferERC20Token(selectedAsset.address, numberToBig(amountIn, selectedAsset.decimals));

        return {
            to: destinationAddress,
            data: calldata,
            gasLimit: 100000,
            value: 0,
            chainId: selectedNetwork.chainId.toString()
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
                    network={selectedNetwork} 
                    onSelectedAssetChanged={setSelectedAsset} />
            </Stack>

            <ReadonlyInput 
                content={account.eoa} 
                label="From (Managed Wallet)" />

            <EvmAddressInput label="To"
                onAddressChanged={setDestinationAddress} />

            <AmountInput
                asset={selectedAsset}
                network={selectedNetwork}
                balances={userAccountBalances}
                onAmountInChanged={setAmountIn} />

            <EnqueueTransactionButton
                sx={{marginTop: 6}}
                onAction={makeTransaction} 
                onActionCompleted={onActionCompleted}
                active={canSubmit}
            />

        </>
    )
}