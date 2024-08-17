import { Box, Button, Stack } from "@mui/material";
import { useContext, useState } from "react";
import PropTypes from 'prop-types';
import SubmitTransactionButton from "../../components/SubmitTransactionButton";
import { depositERC20 } from "./deposit";
import { numberToBig } from "../../lib/chain/numbers";
import NetworkSelector from "../../components/NetworkSelector";
import ReadonlyInput from "../../components/ReadonlyInput";
import AssetSelector from '../../components/AssetSelector';
import AmountInput from "../../components/AmountInput";
import ConnectedAddressContext from "../../context/ConnectedAddressContext";
import UserAccountContext from "../../context/UserAccountContext";

function DepositAction({ account, onActionCompleted }){
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [amountIn, setAmountIn] = useState(0);
    const { connectedAddressBalances  } = useContext(ConnectedAddressContext)

    const canSubmit = selectedNetwork != null && selectedAsset != null && amountIn != null;

    async function submitTransaction(signer){
        const amount = numberToBig(Number(amountIn), selectedAsset.decimals);

        return depositERC20(signer, account.eoa, selectedAsset.address, amount);
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
                label="To (Managed Wallet)" />

            <AmountInput
                balances={connectedAddressBalances}
                asset={selectedAsset}
                network={selectedNetwork}
                onAmountInChanged={setAmountIn} />


            <SubmitTransactionButton 
                network={selectedNetwork}
                disabled={!canSubmit} 
                label="Deposit Assets" 
                onSubmitTransaction={submitTransaction} 
                callback={onActionCompleted}
                sx={{marginTop: 6}}
                waitForConfirmation={true} />
        </>
    )
}

DepositAction.propTypes = {
    account: PropTypes.object.isRequired,
    onActionCompleted: PropTypes.func.isRequired
};

export default DepositAction