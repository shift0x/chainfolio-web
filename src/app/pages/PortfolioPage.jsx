import { Box, Button, Grid, Dialog, Typography, DialogTitle } from '@mui/material';
import { useContext, useState } from 'react';
import PortfolioHoldings from '../../features/portfolio-holdings/PortfolioHoldings';
import { useConnectionStatus } from '@thirdweb-dev/react';
import Web3WalletConnection from '../../features/web3-wallet-connection/Web3WalletConnection';
import CreateNewAccount from '../../features/create-account/CreateNewAccount';
import SwapInitiator from '../../features/swap-action/SwapInitiator';
import TransferAction from '../../features/transfer-action/TransferAction';
import WithdrawAction from '../../features/withdraw-action/WithdrawAction';
import DepositAction from '../../features/deposit-action/DepositAction';
import UserAccountContext from '../../context/UserAccountContext';
import ConnectedAddressContext from '../../context/ConnectedAddressContext';

const headings = [
    { id: "holdings", name: "Holdings" },
    { id: "earn", name: "Earn" },
    { id: "borrowAndLend", name: "Borrow / Lend" },
]


const headingStyle = (selected) => {
    return {
        mr: 6,
        fontSize: "1.75em",
        color: selected ? "#000" : "#CCC",
        borderBottom: selected ? "2px solid #000" : "none",
        cursor: "pointer"
    }
}

const requiredActionContainer = (content) => {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 13,
            border: "1px solid #efefef",
            backgroundColor: "#fcfcfc",
            borderRadius: 2
        }}>
            {content}
        </Box>
    )
}

export default function PortfolioPage(){
    const [ selectedHeading, setSelectedHeading] = useState("holdings")
    const [ isModalActive, setIsModalActive] = useState(false);
    const [ activeModalContent, setActiveModalContent] = useState(null);
    const { userAccount, updateUserAccount } = useContext(UserAccountContext)
    const { updateConnectedAddressBalances } = useContext(ConnectedAddressContext)

    
    const connectionStatus = useConnectionStatus();

    function renderModalContent(content){
        setActiveModalContent(content);
        setIsModalActive(true)
    }

    async function updateBalancesAndClose(){
        await updateConnectedAddressBalances();
        await updateUserAccount();

        closeModal()
    }

    function closeModal(){
        setIsModalActive(false)
    }

    function getActiveModal(){
        switch(activeModalContent) {
            case "swap":
                return <SwapInitiator />
            case "transfer":
                return <TransferAction account={userAccount} onActionCompleted={closeModal} />
            case "withdraw":
                return <WithdrawAction account={userAccount} onActionCompleted={closeModal} />
            case "deposit":
                return <DepositAction account={userAccount} onActionCompleted={updateBalancesAndClose} />
            default:
                return null;
        }
    }
    

    function getContent(){
        if(connectionStatus != "connected")
            return requiredActionContainer(<Web3WalletConnection active={true} />);
        else if(!userAccount) 
            return requiredActionContainer(<CreateNewAccount />);

        switch(selectedHeading){
            case "holdings":
                return <PortfolioHoldings renderModal={renderModalContent} />
            default:
                return <></>
        }
    }

    return (
        <>
            <Grid sx={{
                display: "flex",
                flexDirection: "row",
            }}>
                { headings.map(heading => (
                    <Typography 
                        variant="h3" 
                        sx={headingStyle(selectedHeading==heading.id)}
                        onClick={ () => { setSelectedHeading(heading.id)}}
                    >{heading.name}</Typography>
                ))}

                { 
                    userAccount == null ? null : 

                    <Box sx={{
                        marginLeft: "auto",
                        justifyContent: "flex-end",
                        flexGrow: 1,
                        textAlign: "right"
                    }}>
                        <Button variant='text' onClick={() => { renderModalContent("deposit") }}>Deposit</Button>
                    </Box>
                
                }
            </Grid>
            <Box sx={{ mt: 4 }}>
                { getContent() }
            </Box>

            <Dialog open={isModalActive} onClose={ () => { setIsModalActive(false)}}>
                <Box sx={{ 
                    minWidth: "400px",
                    backgroundColor: "#f5f5f5"
                }}>
                    <DialogTitle>
                        <Typography variant="h6" sx={{ 
                            fontFamily: "Poppins",
                            fontSize: "15px",
                            textTransform: "uppercase",
                            textAlign: "center"
                        }}>{activeModalContent}</Typography>
                    </DialogTitle>

                    <Box sx={{ backgroundColor: "#fff", padding: 2, minHeight: "300px", pb: 4 }}>
                        { getActiveModal() }

                        <Button variant="outlined" sx={{width: "100%", marginTop: 2}} onClick={closeModal}>Cancel</Button>
                    </Box>
                </Box>
            </Dialog>
            
        </>
    )
}