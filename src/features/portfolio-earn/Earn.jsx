import { useEffect, useState } from "react";
import StyledTable from "../../components/StyledTable"
import { useNetworks } from "../../providers/NetworksProvider"
import { getUniswapV3LiquidityData } from "../../lib/reader/uniswapV3Position";
import { useUserAccount } from "../../providers/UserAccountProvider";
import NetworkWithIcon from "../../components/NetworkWithIcon";
import { Stack, Box, Button, Skeleton } from "@mui/material";
import { StyledChip } from "../../components/StyledChip";
import LiquidityPoolInfoCard from "../../components/LiquidityPoolInfoCard";

const actionButtonStyle = {
    padding: "3px 10px"
}

export default function Earn({renderModal}){
    const { networks, getNetworkTokenByChainId } = useNetworks();
    const { userAccount } = useUserAccount();

    const [ rows, setRows ] = useState([]);
    const [ isFetching, setIsFetching ] = useState(false);

    const allLiquidityPools = networks.map(network => {
        return (network.exchanges ?? []).map(exchange => {
            return exchange.pools
        }).flat()
    }).flat()


    const makeRecordTags = (record) => {
        
        return (
            <Stack direction="column">
                <StyledChip 
                    label={record.exchange.name.toLowerCase()}  />

                {
                    record.active ?
                        <StyledChip sx={{mt: 1}} label="earning" />
                        :
                        null
                }
                
                
            </Stack>
        )
    }

    const createRows = (records) => {
       return records.map(record => {
            const poolTokens = record
                .tokens
                .map(token => { return getNetworkTokenByChainId(record.network.chainId, token) });

            return {
                pool: (
                    <LiquidityPoolInfoCard record={record} tokens={poolTokens} />
                ), 

                tags: makeRecordTags(record),

                chain: <NetworkWithIcon network={record.network} />,
                
                actions: (
                    <Stack direction="row" spacing={1}>
                        <Button variant='outlined' 
                            sx={actionButtonStyle} 
                            onClick={() => { 
                                renderModal("enter-liquidity-pool", "Enter Liquidity Pool", { record, poolTokens, updateLiquidityPoolData }) 
                            }} 
                            disabled={record.active}>Enter</Button>
                        <Button variant='outlined' sx={actionButtonStyle} onClick={() => { }} disabled={!record.active}>Exit</Button>
                    </Stack>
                )
            }
        })
    }

    const updateLiquidityPoolData = async () => {
        setIsFetching(true);

        const poolRequests = networks.map(network => {
            return new Promise(async (resolve) => {
                const exchanges = network.exchanges ?? [];
                let exchangeTableRows = [];

                for(var i =0; i < exchanges.length; i++){
                    const exchange = exchanges[i];

                    if(exchange.type != "uniswap-v3"){ continue; }

                    const pools = await getUniswapV3LiquidityData(network.chainId, exchange.pools, userAccount.eoa, exchange.params.positionManager);
                    const poolModels = pools.map(pool => { return {...pool, network, exchange} })

                    exchangeTableRows = [
                        ...exchangeTableRows,
                        ...poolModels
                    ]
                }

                resolve(exchangeTableRows);
            });
        })

        const allLiquidityPools = await Promise.all(poolRequests);

        const tableRows = createRows(allLiquidityPools.flat());

        setTimeout(() => {
            setIsFetching(false);
            setRows(tableRows);
        }, 750)
        
    }

    useEffect(() => {
        updateLiquidityPoolData();
    }, [networks, userAccount])

    function createHeading(name, id, content){
        return { name, id, content }
    }

    const headings = [
        createHeading("Pool", "pool"),
        createHeading("", "tags"),
        createHeading("Chain", "chain"),
        createHeading("", "actions")
    ]

    const containerWidth = "800px"

    return (
        <Box>
            {
                isFetching ?
                    <Stack direction="column"
                        sx={{ width: containerWidth, margin: "auto"}}
                    >
                        {
                            allLiquidityPools.map(() => (
                                <>
                                    <Skeleton variant="text" height="40px" />
                                    <Skeleton variant="rectangular" sx={{mt: "5x"}} />
                                    <Skeleton variant="text" height="40px" sx={{mt: "5px", mb: "10px"}} />
                                </>
                            ))
                        }
                    </Stack>

                    :

                    <StyledTable headings={headings} rows={rows} sx={{ width: containerWidth, margin: "auto"}} />
            }
            
        </Box>
    )
}