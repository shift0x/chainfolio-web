import { numberFromBig, numberToBig } from "../../lib/chain/numbers"

const endpoints = {
    "11155111": "https://sepolia.api.0x.org"
}

export const priceSwap = async (from, to, amountIn, chainId) => {
    if(!endpoints[chainId.toString()]){
        return null
    }

    return call(from, to, amountIn, chainId, "price")
}

export const quoteSwap = async (from, to, amountIn, chainId) => {
    if(!endpoints[chainId.toString()]){
        return null
    }

    return call(from, to, amountIn, chainId, "quote");
}

async function call(from, to, amountIn, chainId, operation){
    const amountInBig = numberToBig(amountIn, from.decimals)

    const args = new URLSearchParams({
        sellToken: from.address,
        buyToken: to.address,
        sellAmount: amountInBig
    })

    const url = `${endpoints[chainId.toString()]}/swap/v1/${operation}?${args}`
    const result = { amountOut: -1 }

    try {
        const response = await fetch(url, {
            headers : {
                "0x-api-key": "32bf0773-ae1e-4389-ba61-34115a695dd3"
            }
        });

        const body = await response.json();

        if(body.error != null){ throw body.error; }
    
        result.amountOut = numberFromBig(body.buyAmount, to.decimals);
        result.data = body
    } catch(err){
        result.error = err
    } finally {
        return result
    }
}