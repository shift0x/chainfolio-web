import { ethers } from "ethers";
import { getRPC } from "./rpc";

export async function sendTransaction(signer, to, data, value){
    const tx = { to }

    if(data)
        tx.data = data;

    if(value)
        tx.value = value;

    const estimatedGas = await signer.estimateGas(tx);

    tx.gasLimit = estimatedGas.mul(2);

    return await signer.sendTransaction(tx);
}

export async function waitForTxReceipt(chainId, txHash) {
    const rpc = getRPC(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpc);

    return provider.waitForTransaction(txHash);
}