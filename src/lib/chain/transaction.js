
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