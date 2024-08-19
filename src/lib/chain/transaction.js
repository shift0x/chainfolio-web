import { ethers } from "ethers";
import { getRPC } from "./rpc";

export async function createTransaction(signer, to, data, value, includeGasLimit){
    const tx = { to }

    if(data)
        tx.data = data;

    if(value)
        tx.value = value;

    if(includeGasLimit){
        const gasLimit = await signer.estimateGas(tx);

        tx.gasLimit = gasLimit.mul(2);
    } 

    return tx;
}

export async function sendTransaction(signer, to, data, value){
    const tx = await createTransaction(signer, to, data, value, true);

    return await signer.sendTransaction(tx);
}

export async function waitForTxReceipt(chainId, txHash) {
    const rpc = getRPC(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpc);

    return provider.waitForTransaction(txHash);
}