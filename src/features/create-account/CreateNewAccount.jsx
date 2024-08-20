import { Button, Box, Typography, CircularProgress, Backdrop, Stack } from "@mui/material";
import { useAccountManager } from "../../lib/account-manager/accountManager";
import { useSigner } from "@thirdweb-dev/react";
import { useUserAccount } from "../../providers/UserAccountProvider";
import { useConnectedAddress } from "../../providers/ConnectedAddressProvider";
import { useEffect, useState } from "react";

export default function CreateNewAccount(){
    const [ isCreatingAccount, setIsCreatingAccount ] = useState(false);
    const [ createAccountStartTime, setCreateAccountStartTime ] = useState(null);
    const [ tick, setTick ] = useState(0);

    const accountManager = useAccountManager();
    const signer = useSigner();
    const { userAccount, updateUserAccount } = useUserAccount();
    const { connectedAddress } = useConnectedAddress();

    async function createAccount(){
        setIsCreatingAccount(true);
        
        await accountManager.createAccount(signer, connectedAddress, {});

        setCreateAccountStartTime((new Date()).getTime());
    }

    useEffect(() => {
        if(!isCreatingAccount) { return }

        setTimeout(async () => {
            await updateUserAccount();

            setTick(prev => { return prev+1});
        }, 2000);
    }, [tick, isCreatingAccount])

    useEffect(() => {
        if(!userAccount || !isCreatingAccount) { return }

        setIsCreatingAccount(false);
    }, [userAccount])

    const getCreatingAccountText = () => {
        const startTime = createAccountStartTime ?? (new Date()).getTime()
        const elapsedTime = ((new Date()).getTime() - startTime)/1000;

        return elapsedTime > 25 ?
            `This is taking longer than expected. Check the zrSign contract (0xA7AdF06a1D3a2CA827D4EddA96a1520054713E1c) 
            on Arbitrum Sepolia and see if the ZrKeyRes contract call from the MPC network has failed. If is has, it's likely because the
            call ran out of gas. Contact the zrSign team and have them increase the gas limit for this call, then retry` 
            :
            `Creating your managed user account. Hang tight!`
    }

    return (
        <>
            <Box sx={{
                textAlign: "center"
            }}>
                <Typography sx={{
                    color: "#555"
                }}>
                    Let's create your managed account. This is an EOA that will securely hold your assets across different blockchains and execute transactions on your behalf, allowing you to seamlessly participate in DeFi across multiple networks from a single account. Keys are securley managed by ZenRocks MPC network
                </Typography>
                <Button 
                    disabled={isCreatingAccount}
                    key="btn_create_account" 
                    variant="contained" 
                    sx={{ pr: 5, pl: 5, mt: 3}} 
                    onClick={() => { createAccount() }}>
                    Create Account
                </Button>
            </Box>

            <Backdrop
                sx={{ color: '#fff', zIndex: 10000000}}
                open={isCreatingAccount}

            >
                <Stack direction="column" sx={{
                    justifyContent: "center",
                    width: "100%"
                }}>
                    <Box sx={{width:  "100%"}}>
                        <Typography sx={{mb: 1, width: "50%", margin: "auto", textAlign: "center"}}>
                            {getCreatingAccountText()}
                        </Typography>
                    </Box>
                    
                    <Box sx={{textAlign: "center"}}>
                        <CircularProgress color="inherit" />
                    </Box>
                    
                </Stack>
                
            </Backdrop>
        </>
    )
}