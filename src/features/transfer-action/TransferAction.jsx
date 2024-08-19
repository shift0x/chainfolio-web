import { Stack } from "@mui/material";
import { useContext, useState } from "react";
import { numberToBig } from "../../lib/chain/numbers";
import ReadonlyInput from "../../components/ReadonlyInput";
import AssetSelector from "../../components/AssetSelector";
import AmountInput from "../../components/AmountInput";
import NetworkSelector from "../../components/NetworkSelector";
import EvmAddressInput from "../../components/EvmAddressInput";
import { useUserAccount } from "../../providers/UserAccountProvider";
import { transferERC20Token } from "../../lib/erc20/erc20";
import { formatNumber } from "../../lib/format";
import { shortenAddress } from "@thirdweb-dev/react";
import { EnqueueTransactionButton } from "../transaction-bundler/EnqueueTransactionButton";

export default function TransferAction({ account, onNewTransaction, onActionCompleted }){
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [destinationAddress, setDestinationAddress] = useState("");
    const [amountIn, setAmountIn] = useState(0);
    const { userAccountBalances } = useUserAccount();
    
    const canSubmit = selectedNetwork != null && selectedAsset != null && amountIn != null && destinationAddress != null;

    async function makeTransaction(){
        const calldata = await transferERC20Token(destinationAddress, numberToBig(amountIn, selectedAsset.decimals));
        const label = `transfer ${formatNumber(amountIn)} ${selectedAsset.symbol.toUpperCase()} to ${ shortenAddress(destinationAddress, false) }`

        return {
            label: label,
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

            <EvmAddressInput label="To"
                containerSx={{marginTop: 6}}
                onAddressChanged={setDestinationAddress} />

            <AmountInput
                asset={selectedAsset}
                network={selectedNetwork}
                balances={userAccountBalances}
                onAmountInChanged={setAmountIn} />

            <EnqueueTransactionButton
                onAction={makeTransaction} 
                onActionCompleted={onActionCompleted}
                active={canSubmit}
            />

           

        </>
    )
}