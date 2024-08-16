import { getRPC } from "../chain/rpc"
import { callContract, makeCalldata } from "../chain/contract"
import accountManagerAbi from './contracts/accountManagerAbi.json'
import { ethers } from "ethers"
import { sendTransaction } from "../chain/transaction"

const chainId = 421614
const accountManagerAddress = "0xBF90F0C5D30d2DebbC940369DA435687E4C2e701"

async function getAccount(address){
    const rpc = getRPC(chainId);
    const account = (await callContract(rpc, accountManagerAbi, accountManagerAddress, "getAccount", address))[0];

    return !account.created ? null : account;
}

async function createAccount(signer, data){
    const args = ethers.utils.defaultAbiCoder.encode(["string"], [JSON.stringify(data)]);
    const calldata = makeCalldata(accountManagerAbi, "createAccount", args);

    await sendTransaction(signer, accountManagerAddress, calldata);
}



function getChainId(){
    return chainId;
}


export function useAccountManager() {
    return {
        createAccount,
        getAccount,
        getChainId,
    }
    
}