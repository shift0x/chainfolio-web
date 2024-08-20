import { getRPC } from "../chain/rpc"
import { callContract, makeCalldata } from "../chain/contract"
import accountManagerAbi from './contracts/accountManagerAbi.json'
import zrSignAbi from './contracts/zrSignAbi.json'
import { ethers } from "ethers"
import { sendTransaction } from "../chain/transaction"

const chainId = 421614
//const accountManagerAddress = "0x861C552fFDD44c0953cc07F672d4c7CC7CdFF68a";
const accountManagerAddress = "0x3cA3a2319a4194D269C9e8a0d1ab4887e60D7EAA";
const zrSignAddress = "0xA7AdF06a1D3a2CA827D4EddA96a1520054713E1c";

async function getAccount(address){
    const rpc = getRPC(chainId);
    const chainAccount = (await callContract(rpc, accountManagerAbi, accountManagerAddress, "getAccount", address))[0];

    if(!chainAccount.created){
        return null
    }

    const account = {
        zrWalletIndex: chainAccount.zrWalletIndex,
        data: chainAccount.data,
        eoa: await getAccountEOA(chainAccount.zrWalletIndex),
        active: chainAccount.active
    }

    account.created = account.eoa != null;

    console.log({account})

    return !account.created ? null : account;
}

async function getAccountEOA(index){
    const evmWalletType = "0xe146c2986893c43af5ff396310220be92058fb9f4ce76b929b80ef0d5307100a"
    const rpc = getRPC(chainId)

    try {
        const eoa = (await callContract(rpc, zrSignAbi, zrSignAddress, "getZrKey", evmWalletType, accountManagerAddress, index))[0];

        return eoa
    } catch(err){ return null }
}

async function createAccount(signer, owner, data){
    const args = ethers.utils.defaultAbiCoder.encode(["address", "string"], [owner, JSON.stringify(data)]);
    const calldata = makeCalldata(accountManagerAbi, "createAccount", args);

    const tx = await sendTransaction(signer, accountManagerAddress, calldata);

    return tx ? tx.wait() : null;
}

async function executeTransactions(signer, txs, userAccount){
    for(var i = 0; i < txs.length; i++){

        console.log({tx: txs[i]});

        const calldata = makeCalldata(accountManagerAbi, "execute", [txs[i]]);
        const tx = await sendTransaction(signer, accountManagerAddress, calldata);

        if(tx){
            await tx.wait();
        }
    }
}


function getChainId(){
    return chainId;
}


export function useAccountManager() {
    return {
        createAccount,
        getAccount,
        getChainId,
        executeTransactions,
    }
    
}