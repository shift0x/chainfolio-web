import { useTransactionQueue } from "../../providers/TransactionQueueProvider";
import NetworkWithIcon from "../../components/NetworkWithIcon";
import StyledTable from "../../components/StyledTable";
import { Box, Button, CircularProgress, Link, Skeleton, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import SubmitTransactionButton from "../../components/SubmitTransactionButton";
import { useNetworks } from "../../providers/NetworksProvider";
import { getGasPrice, getNonce } from "../../lib/chain/rpc";
import { numberFromBig, numberToBig } from "../../lib/chain/numbers";
import { useUserAccount } from "../../providers/UserAccountProvider";
import WarningIcon from '@mui/icons-material/Warning';
import { useSendTransaction } from "../../providers/SendTransactionProvider";
import { createTransaction, watchForCompletedTransactions } from "../../lib/chain/transaction";
import { useSigner } from "@thirdweb-dev/react";
import { useAccountManager } from "../../lib/account-manager/accountManager";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const flexbox = {
    display: "flex",
    alignItems: 'center',
}

const baseTypography = {
    fontSize: ".9em"
}

const txLabelTypographyStyle = {
    ...baseTypography,
    '&::first-letter': {
      textTransform: 'uppercase',
    },
}
export default function SubmitTransactionsAction({ onActionCompleted }){
    const { queuedTransactions, clearTransactionQueue } = useTransactionQueue()
    const { userAccount, userAccountBalances, updateUserAccount } = useUserAccount();
    const { defaultNetwork } = useNetworks();
    const { sendTransactionFromChain } = useSendTransaction();
    
    const [ expectedNonceByNetwork, setExpectedNonceByNetwork ] = useState(null)
    const [ networkTransactionSummary, setNetworkTransactionSummary ] = useState([]);
    const [ isPricingTransactions, setIsPricingTransactions ] = useState(false);
    const [ networkConfirmationStatus, setNetworkConfirmationStatus ] = useState([]);

    const accountManager = useAccountManager();
    const signer = useSigner();
    const canSubmit = networkTransactionSummary.filter(network => { return network.fee > network.userAccountNativeBalance }).length == 0;
    
    
    const headings = [
        { name: "note", id: "note"}
    ];

    const getNetworkStatusContent = (chainId) => {
        const network = networkConfirmationStatus.find(network => { return network.chainId.toString() == chainId.toString()})

        if(!network){
            return <></>
        }

        return network.status == "pending" ?
            <CircularProgress size="14px" sx={{ml: 1}} /> 
            :
            <CheckCircleIcon fontSize="14px" color="success" sx={{ml: 1}} />
    }

    const createTransactionModel = (tx) => {
        return {
            network: <NetworkWithIcon network={tx.network} height="20px" width="20px" sx={{ 
                ...baseTypography,
                minWidth: "150px"
            }} />,
            note: <Typography variant="body1" sx={txLabelTypographyStyle}>{tx.label}</Typography>,
            hash: <Typography variant="body1" sx={txLabelTypographyStyle}>{tx.hash}</Typography>,
        }
    }

    const updateModels = async () => {
        const transactionsByNetwork = {}

        for(var i = 0; i < queuedTransactions.length; i++){
            const tx = queuedTransactions[i];

            tx.id = i;

            let entry = transactionsByNetwork[tx.network.chainId];

            if(!entry) {
                entry = { gasLimit: 0, gasPrice: 0, fee: 0, network: tx.network, transactions: [], models: [], chainId: tx.network.chainId };

                const gasPriceAsBig = await getGasPrice(tx.network.chainId);

                entry.gasPrice = numberFromBig(gasPriceAsBig, 18);
                entry.userAccountNativeBalance = userAccountBalances != null ? userAccountBalances[tx.network.chainId].native : 0;
            }

            entry.gasLimit += tx.params.gasLimit;
            entry.fee = (entry.gasLimit * entry.gasPrice) * 10;
            entry.transactions.push(tx);
            entry.models.push(createTransactionModel(tx));

            transactionsByNetwork[tx.network.chainId] = entry;
        }

        const updatedModels = Object.keys(transactionsByNetwork).map(key => { return transactionsByNetwork[key]});

        setNetworkTransactionSummary(updatedModels);
        setIsPricingTransactions(false);
    }

    const updateNetworkTransactions = async () => {
        if(!expectedNonceByNetwork){
            return
        }

        const pendingNetworkTransactions = Object.keys(expectedNonceByNetwork)
            .map(chainId => {
                return { chainId: chainId, nonce: expectedNonceByNetwork[chainId]}
            })

        watchForCompletedTransactions(pendingNetworkTransactions, userAccount.eoa, setNetworkConfirmationStatus);
    }

    useEffect(() => {
        setIsPricingTransactions(true);
        setTimeout(() => { updateModels() }, 1000)

    }, [userAccountBalances, queuedTransactions])

    useEffect(() => {
        updateNetworkTransactions()
    }, [expectedNonceByNetwork])

    useEffect(() => {
        if(networkConfirmationStatus.length == 0){ return ; }

        const pendings = networkConfirmationStatus.filter(x => { return x.status == "pending"}).length;

        if(pendings > 0) { return }

        setTimeout(() => {
            clearTransactionQueue()
            onActionCompleted()
        }, 1500)

    }, [networkConfirmationStatus])

    const submitUserAccountTransactions = async () => {
        let transactionParams = [];
        let nonceByNetwork = {}
        
        for(var i = 0; i < networkTransactionSummary.length; i++){
            const network = networkTransactionSummary[i];
            const nonce = await getNonce(network.chainId, userAccount.eoa);

            const networkTxs = network.transactions.map((tx, index) => {
                const txNonce = nonce + index;

                nonceByNetwork[network.chainId] = txNonce + 1;

                return {
                    to: tx.params.to,
                    data: tx.params.data,
                    gasPrice: numberToBig(network.gasPrice, 18),
                    gasLimit: tx.params.gasLimit,
                    value: numberToBig(tx.params.value ?? 0, 18),
                    chainId: network.chainId.toString(),
                    zrWalletIndex: userAccount.zrWalletIndex,
                    nonce: txNonce,
                    eoa: userAccount.eoa
                }
                
            });

            transactionParams = transactionParams.concat(networkTxs);
            
        }

        setExpectedNonceByNetwork(nonceByNetwork);

        return accountManager.executeTransactions(signer, transactionParams, userAccount);
    }

    const onTransactionSubmitted = async () => { }

    const topUpGas = async (model) => {
        const topUpAmount = model.fee;
        const topUpAmountBig = numberToBig(topUpAmount, 18);

        const tx = await createTransaction(signer, userAccount.eoa, "0x", topUpAmountBig, true);

        const callback = async (response) => {
            await updateUserAccount();
        }

        sendTransactionFromChain(model.network.chainId, tx, callback);
    }

    const clearQueue = () => {
        clearTransactionQueue();
        onActionCompleted();
    }

    

    return (
        <>
            {
                isPricingTransactions ? 

                    queuedTransactions.map(() => (
                        <Box sx={{mb: 1}}>
                            <Skeleton variant="text" />
                            <Skeleton variant="rectangular" height="50px" />
                        </Box>
                    ))

                     :

                    

                    networkTransactionSummary.map(network => (
                        <Box sx={{mb: 2}}>
                            <Box sx={{
                                ...flexbox,
                                width: "100%",
                                justifyContent: "space-between",
                                mb: 1
                            }}>
                                <NetworkWithIcon height="20px" width="20px" network={network.network} sx={baseTypography}  />

                                {getNetworkStatusContent(network.chainId)}

                                <Box sx={{
                                    ...flexbox,
                                    flexGrow: 1,
                                    justifyContent: "flex-end"
                                }}>
                                    {
                                        network.fee > network.userAccountNativeBalance ?
                                            <>
                                                <WarningIcon color="error" fontSize="17px" />
                                                <Link onClick={() => { topUpGas(network)}} 
                                                    sx={{
                                                        ...baseTypography,
                                                        cursor: "pointer",
                                                        color: "red"
                                                    }}> &nbsp;
                                                    Insufficent Gas Balance (Top Up)
                                                </Link>
                                            </> 
                                            :
                                            null
                                    }
                                </Box>
                            </Box>
                            
                            
                            <StyledTable headings={headings} rows={network.models} showHeadings={false} elevate={false} />
                        </Box>
                    ))
                       
            }
            
            <SubmitTransactionButton 
                network={defaultNetwork}
                disabled={!canSubmit && !isPricingTransactions} 
                showDivider={false}
                label={`Submit Transaction Bundle (${queuedTransactions.length})`}
                onSubmitTransaction={submitUserAccountTransactions} 
                callback={onTransactionSubmitted}
                waitForConfirmation={false} />

            <Button variant="outlined" 
                sx={{width: "100%", marginTop: 2}} 
                onClick={clearQueue}>Remove All
            </Button>
        </>
    )
}