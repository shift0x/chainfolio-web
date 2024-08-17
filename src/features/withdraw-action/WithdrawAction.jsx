import { Stack } from "@mui/material";
import { useContext, useState } from "react";
import { numberToBig } from "../../lib/chain/numbers";
import ReadonlyInput from "../../components/ReadonlyInput";
import AssetSelector from "../../components/AssetSelector";
import AmountInput from "../../components/AmountInput";
import NetworkSelector from "../../components/NetworkSelector";
import { useAddress } from "@thirdweb-dev/react";
import { EnqueueTransactionButton } from "../../components/ActionButton";
import { useUserAccount } from "../../providers/UserAccountProvider";

export default function WithdrawAction({ account, onActionCompleted }){
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [amountIn, setAmountIn] = useState(0);
    const { userAccountBalances } = useUserAccount();

    const connectedAddress = useAddress();
    const canSubmit = selectedNetwork != null && selectedAsset != null && amountIn != null && connectedAddress != null;

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

            <ReadonlyInput 
                content={connectedAddress} 
                label="To (Owner)" />

            <AmountInput
                balances={userAccountBalances}
                asset={selectedAsset}
                network={selectedNetwork}
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