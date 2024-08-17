import { Button, Box, Typography } from "@mui/material";
import { useAccountManager } from "../../lib/account-manager/accountManager";
import { useSigner } from "@thirdweb-dev/react";
import { useContext } from "react";
import UserAccountContext from "../../context/UserAccountContext";

export default function CreateNewAccount(){
    const accountManager = useAccountManager();
    const signer = useSigner();
    const { updateUserAccount } = useContext(UserAccountContext);

    async function createAccount(){
        await accountManager.createAccount(signer, {});
        await updateUserAccount();
    }

    return (
        <Box sx={{
            textAlign: "center"
        }}>
            <Typography sx={{
                color: "#555"
            }}>
                Let's create your managed account. This is an EOA that will securely hold your assets across different blockchains and execute transactions on your behalf, allowing you to seamlessly participate in DeFi across multiple networks from a single account. Keys are securley managed by ZenRocks MPC network
            </Typography>
            <Button key="btn_create_account" variant="contained" sx={{ pr: 5, pl: 5, mt: 3}} onClick={() => { createAccount() }}>
                Create Account
            </Button>
        </Box>
    )
}