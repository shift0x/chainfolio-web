import { getRPC } from "../chain/rpc"
import { callContract, makeCalldata } from "../chain/contract"
import accountManagerAbi from './contracts/accountManagerAbi.json'
import { ethers } from "ethers"
import { sendTransaction } from "../chain/transaction"

const chainId = 421614
const accountManagerAddress = "0x861C552fFDD44c0953cc07F672d4c7CC7CdFF68a"

async function getAccount(address){
    const rpc = getRPC(chainId);
    const account = (await callContract(rpc, accountManagerAbi, accountManagerAddress, "getAccount", address))[0];

    return !account.created ? null : account;
}

async function createAccount(signer, data){
    const args = ethers.utils.defaultAbiCoder.encode(["string"], [JSON.stringify(data)]);
    const calldata = makeCalldata(accountManagerAbi, "createAccount", args);

    const tx = await sendTransaction(signer, accountManagerAddress, calldata);

    return tx.wait();
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