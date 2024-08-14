import PropTypes from 'prop-types';
import { Button, Stack, Typography } from '@mui/material';
import StyledTable from '../../components/StyledTable';

const actionButtonStyle = {
    padding: "3px 10px"
}

function PortfolioHoldings({ renderModal }){

    function createHeading(name, id){
        return { name, id }
    }

    function createRow(token){
        return {
            asset: ( 
                <Stack direction="row" spacing={1}>
                    <img src={token.img} height="25px" width="25px" />
                    <Typography variant='body1'>{token.name}</Typography>
                </Stack>
            ),
            symbol: (
                <Typography variant='body1'>{token.symbol}</Typography>
            ),
            chain: (
                <Stack direction="row" spacing={1}>
                    <img src={token.chain.img} height="25px" width="25px" />
                    <Typography variant='body1'>{token.chain.name}</Typography>
                </Stack>
            ),
            balance: (
                <Typography variant='body1'>{token.balance}</Typography>
            ),
            value: (
                <Typography variant='body1'>{token.value}</Typography>
            ),
            actions: (
                <Stack direction="row" spacing={1}>
                    <Button variant='outlined' sx={actionButtonStyle} onClick={() => { renderModal("swap") }} >swap</Button>
                    <Button variant='outlined' sx={actionButtonStyle} onClick={() => { renderModal("transfer") }}>transfer</Button>
                    <Button variant='outlined' sx={actionButtonStyle} onClick={() => { renderModal("withdraw") }}>withdraw</Button>
                </Stack>
            )
        }
    }

    const headings = [
        createHeading("Asset", "asset"),
        createHeading("Symbol", "symbol"),
        createHeading("Chain", "chain"),
        createHeading("Balance", "balance"),
        createHeading("Value (USD)", "value"),
        createHeading("Actions", "actions")
    ]

    const rows = [
        { 
            img: "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
            name: "Circle USDC",
            symbol: "USDC",
            balance: 20,
            value: 20,
            chain: {
                img: "https://coin-images.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg?1696516109",
                name: "Arbitrum Sepolia"
            }
        },
        { 
            img: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
            name: "Wrapped Ether",
            symbol: "WETH",
            balance: 1,
            value: 2700,
            chain: {
                img: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
                name: "Sepolia"
            }
        }
    ].map(row => { return createRow(row) });

    return (
        <>
            <StyledTable headings={headings} rows={rows} />
        </>
    )
}

PortfolioHoldings.propTypes = {
    renderModal: PropTypes.func.isRequired,
};


export default PortfolioHoldings