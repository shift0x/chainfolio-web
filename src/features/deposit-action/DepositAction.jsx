import { Box, Button } from "@mui/material";
import { useState } from "react";
import PropTypes from 'prop-types';
import SubmitTransactionButton from "../../components/SubmitTransactionButton";
import { depositERC20 } from "./deposit";
import { numberToBig } from "../../lib/chain/numbers";
import NetworkSelector from "../../components/NetworkSelector";
import ReadonlyInput from "../../components/ReadonlyInput";
import AssetSelector from '../../components/AssetSelector';
import AmountInput from "../../components/AmountInput";

function DepositAction({ account, onClose }){
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [amountIn, setAmountIn] = useState(0);

    const canSubmit = selectedNetwork != null && selectedAsset != null && amountIn != null;

    async function submitTransaction(signer){
        const amount = numberToBig(Number(amountIn), selectedAsset.decimals);

        return depositERC20(signer, account.eoa, selectedAsset.address, amount);
    }

    function onSubmitTransactionCallback(){
        onClose();
    }
    
    return (
        <>
            <NetworkSelector 
                onNetworkChanged={setSelectedNetwork} />
            
            <ReadonlyInput 
                content={account.eoa} 
                label="To (Managed Wallet)" />

            <AssetSelector 
                network={selectedNetwork} 
                onSelectedAssetChanged={setSelectedAsset} />

            <AmountInput
                asset={selectedAsset}
                network={selectedNetwork}
                onAmountInChanged={setAmountIn} />


            <Box sx={{marginTop: 6}}>

                <SubmitTransactionButton 
                    network={selectedNetwork}
                    disabled={!canSubmit} 
                    label="Deposit Assets" 
                    onSubmitTransaction={submitTransaction} 
                    callback={onSubmitTransactionCallback}
                    waitForConfirmation={true} />

                <Button variant="outlined" sx={{width: "100%", marginTop: 2}} onClick={onClose}>Cancel</Button>
            </Box>
        </>
    )
}

DepositAction.propTypes = {
    onClose: PropTypes.PropTypes.func.isRequired,
    account: PropTypes.PropTypes.object.isRequired,
};

export default DepositAction