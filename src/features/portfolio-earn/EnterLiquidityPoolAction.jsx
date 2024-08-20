import { Box } from "@mui/material"
import LiquidityPoolInfoCard from "../../components/LiquidityPoolInfoCard"
import AmountInput from "../../components/AmountInput"
import { useState } from "react"
import { useUserAccount } from "../../providers/UserAccountProvider"
import { EnqueueTransactionButton } from "../transaction-bundler/EnqueueTransactionButton"
import { ensureERC20Allowance } from "../../lib/erc20/erc20"
import { useTransactionQueue } from "../../providers/TransactionQueueProvider"
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { getRPC } from "../../lib/chain/rpc"
import { ethers } from 'ethers'
import { Pool, Position, NonfungiblePositionManager } from '@uniswap/v3-sdk'
import { numberToBig } from "../../lib/chain/numbers"
import { Percent, Token  } from "@uniswap/sdk-core"

const EnterLiquidityPoolAction = ({ onActionCompleted, data, sx={}, ...props }) => {
    const { addQueuedTransaction } = useTransactionQueue()
    const { userAccount, userAccountBalances } = useUserAccount()
    const [ token0AmountIn, onToken0AmountInChanged] = useState(null);
    const [ token1AmountIn, onToken1AmountInChanged] = useState(null);

    const canSubmit = token0AmountIn > 0 && token1AmountIn > 0;
    const token0 = data.poolTokens[0];
    const token1 = data.poolTokens[1];


    const makeTransaction = async () => {
        await ensureERC20Allowance(data.record.network, 
            userAccount.eoa, 
            data.record.exchange.params.positionManager, 
            token0AmountIn,
            token0, 
            `approve uniswap v3 position manager - ${token0.symbol}`,
            addQueuedTransaction
        );

        await ensureERC20Allowance(data.record.network, 
            userAccount.eoa, 
            data.record.exchange.params.positionManager, 
            token1AmountIn,
            token1, 
            `approve uniswap v3 position manager - ${token1.symbol}`,
            addQueuedTransaction
        );

        const rpc = getRPC(data.record.network.chainId);
        const provider = new ethers.providers.JsonRpcProvider(rpc);
        
        const poolContract = new ethers.Contract(data.record.address, IUniswapV3PoolABI.abi, provider);
          
        const [liquidity, slot0] = await Promise.all([
              poolContract.liquidity(),
              poolContract.slot0(),
        ])

        const configuredPool = new Pool(
            new Token(data.record.network.chainId, token0.address,  token0.decimals),
            new Token(data.record.network.chainId, token1.address,  token1.decimals),
            data.record.fee * Math.pow(10, 6),
            slot0.sqrtPriceX96.toString(),
            liquidity.toString(),
            slot0.tick
        );

        const tickBase = Math.round(configuredPool.tickCurrent / configuredPool.tickSpacing) * configuredPool.tickSpacing;
        const tickLower = Number((tickBase - (configuredPool.tickSpacing*2)).toFixed(0))
        const tickUpper = Number((tickBase + (configuredPool.tickSpacing*2)).toFixed(0))

        const position = Position.fromAmounts({
            pool: configuredPool,
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0: numberToBig(token0AmountIn, token0.decimals),
            amount1: numberToBig(token1AmountIn, token1.decimals),
            useFullPrecision: true,
        });

        const mintOptions = {
            recipient: userAccount.eoa,
            deadline: Math.floor(Date.now() / 1000) + 60 * 200,
            slippageTolerance: new Percent(50, 10_000),
        }

        // get calldata for minting a position
        const { calldata } = NonfungiblePositionManager.addCallParameters(position, mintOptions)

        return {
            label: `enter liquidity pool ${token0.symbol} \ ${token1.symbol}`,
            network: data.record.network,
            params: {
                to: data.record.exchange.params.positionManager,
                data: calldata,
                gasLimit: 600000,
                value: 0,
                chainId: data.record.network.chainId.toString()
            }
        }
    }

    return (
        <Box {...props}>
            <LiquidityPoolInfoCard record={data.record} tokens={data.poolTokens} showExchange={true} />

            <AmountInput network={data.record.network} 
                asset={token0}
                balances={userAccountBalances}
                caption={`${token0.symbol} Amount`}
                onAmountInChanged={onToken0AmountInChanged} />

            <AmountInput network={data.record.network}
                asset={token1}
                balances={userAccountBalances}
                caption={`${token1.symbol} Amount`}
                onAmountInChanged={onToken1AmountInChanged} />

            <EnqueueTransactionButton 
                sx={{mt: 4}}
                onAction={makeTransaction} 
                onActionCompleted={onActionCompleted}
                active={canSubmit}
            />
            
        </Box>
    )
}

export default EnterLiquidityPoolAction