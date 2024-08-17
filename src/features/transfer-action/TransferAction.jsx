import { Stack } from "@mui/material";
import { useContext, useState } from "react";
import { numberToBig } from "../../lib/chain/numbers";
import ReadonlyInput from "../../components/ReadonlyInput";
import AssetSelector from "../../components/AssetSelector";
import AmountInput from "../../components/AmountInput";
import NetworkSelector from "../../components/NetworkSelector";
import EvmAddressInput from "../../components/EvmAddressInput";
import { EnqueueTransactionButton } from "../../components/ActionButton";
import UserAccountContext from "../../context/UserAccountContext";

export default function TransferAction({ account, onNewTransaction, onActionCompleted }){
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [destinationAddress, setDestinationAddress] = useState(null);
    const [amountIn, setAmountIn] = useState(0);
    const { userAccountBalances } = useContext(UserAccountContext)

    const canSubmit = selectedNetwork != null && selectedAsset != null && amountIn != null && destinationAddress != null;

    async function makeTransaction(){
        const amount = numberToBig(Number(amountIn), selectedAsset.decimals);

        return
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