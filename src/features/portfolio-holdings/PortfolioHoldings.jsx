import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';
import StyledTable from '../../components/StyledTable';
import { useUserAccount } from '../../providers/UserAccountProvider';
import { useEffect, useState } from 'react';
import { useNetworks } from '../../providers/NetworksProvider';
import NetworkWithIcon from '../../components/NetworkWithIcon';
import NetworkSelector from '../../components/NetworkSelector';
import { formatNumber } from '../../lib/format';

const actionButtonStyle = {
    padding: "3px 10px"
}

function PortfolioHoldings({ renderModal }){
    const [ rows, setRows ] = useState([]);
    const [ selectedNetwork, setSelectedNetwork ] = useState(null);

    const { userAccountBalances } = useUserAccount();
    const { getNetworkTokenByChainId } = useNetworks();

    function createHeading(name, id, content){
        return { name, id, content }
    }

    function createRow(record){
        const token = getNetworkTokenByChainId(record.chainId, record.asset);

        return {
            asset: ( 
                <Stack direction="row" spacing={1}>
                    <img src={token.image} height="25px" width="25px" />
                    <Typography variant='body1'>{token.name}</Typography>
                </Stack>
            ),
            symbol: (
                <Typography variant='body1' sx={{ 
                    textTransform: "uppercase"
                }}>{token.symbol}</Typography>
            ),
            chain: (
                <NetworkWithIcon network={token.chain} />
            ),
            balance: (
                <Typography variant='body1'>{formatNumber(record.balance)}</Typography>
            ),
            actions: (
                <Stack direction="row" spacing={1}>
                    <Button variant='outlined' sx={actionButtonStyle} onClick={() => { renderModal("transfer") }} disabled={record.asset == 'native'}>Transfer</Button>
                    <Button variant='outlined' sx={actionButtonStyle} onClick={() => { renderModal("withdraw") }} disabled={record.asset == 'native'}>Withdraw</Button>
                </Stack>
            )
        }
    }

    const networkSelector = <Box sx={{
        display: "inline-flex"
    }}>
        <NetworkSelector showLabel={false} onNetworkChanged={setSelectedNetwork} 
            sx={{ width: "250px" }}
            selectSx={{backgroundColor: "#fcfcfc"}} />
    </Box>

    const headings = [
        createHeading("Asset", "asset"),
        createHeading("Symbol", "symbol"),
        createHeading("Chain", "chain"),
        createHeading("Balance", "balance"),

        
        createHeading("", "actions", networkSelector)
    ]

    useEffect(() => {
        if(!selectedNetwork){ return; }

        const chains = Object.keys(userAccountBalances);
        const balancesByChain = chains
        .filter(chainId => { return chainId.toString() == selectedNetwork.chainId.toString() })
        .map(chainId => {
            const assets = Object.keys(userAccountBalances[chainId]);
            const balancesByAsset = assets.map(asset => {
                return {
                    chainId: chainId,
                    asset: asset,
                    balance: userAccountBalances[chainId][asset]
                }
            })

            return balancesByAsset
        }).flat();

        const data = balancesByChain.map(balance => { return createRow(balance) });

        setRows(data);
    }, [selectedNetwork, userAccountBalances])

    
    return (
        <>
            <StyledTable headings={headings} rows={rows} justifyContent='flex-end' />
        </>
    )
}

PortfolioHoldings.propTypes = {
    renderModal: PropTypes.func.isRequired,
};


export default PortfolioHoldings