import uniswapV3LiquidityPositionReaderAbi from './contracts/uniswapV3LiquidityPositionAbi.json'
import uniswapV3LiquidityPositionReaderBytecode from './contracts/uniswapV3LiquidityPositionByteCode.js'
import { numberFromBig } from '../chain/numbers';
import { callContractWithStateOverride } from "../chain/contract"
import { getRPC } from "../chain/rpc"

const makeLiquidityPoolsFromResponse = (pools, positions) => {
    const aciveLiquidityPoolPositions = positions
        .filter(position => { return position.Active })
        .map(position => { return position.LiquidityPool })

    return pools.map(pool => {
        return {
            address: pool.Address,
            tokens: [
                pool.Token0,
                pool.Token1
            ],
            fee: numberFromBig(pool.Fee, 6),
            active: aciveLiquidityPoolPositions.indexOf(pool.Address) != -1
        }
    })
}

export async function getUniswapV3LiquidityData(chainId, pools, account, positionManager){
    const rpc = getRPC(chainId);
    const stateOverrideAddress = "0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8";
    const stateOverride = {}

    stateOverride[stateOverrideAddress] = { code: uniswapV3LiquidityPositionReaderBytecode }

    const [liquidityPools, positions] = await callContractWithStateOverride(
        rpc,
        uniswapV3LiquidityPositionReaderAbi,
        stateOverrideAddress,
        "getLiquidityPoolsWithPositions",
        stateOverride,
        account,
        pools,
        positionManager
    )

    const models = makeLiquidityPoolsFromResponse(liquidityPools, positions);

    return models;
}