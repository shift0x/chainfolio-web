import { Box, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import PortfolioHoldings from '../../features/portfolio-holdings/PortfolioHoldings';

export default function PortfolioPage(){
    const [ selectedHeading, setSelectedHeading] = useState("holdings")
    const headings = [
        { id: "holdings", name: "Holdings" },
        { id: "earn", name: "Earn" },
        { id: "borrowAndLend", name: "Borrow / Lend" },
    ]


    const headingStyle = (selected) => {
        return {
            mr: 6,
            fontSize: "1.75em",
            color: selected ? "#000" : "#CCC",
            borderBottom: selected ? "2px solid #000" : "none",
            cursor: "pointer"
        }
    }

    function getContent(){
        switch(selectedHeading){
            case "holdings":
                return <PortfolioHoldings />
            default:
                return <></>
        }
    }

    return (
        <>
            <Grid sx={{
                display: "flex",
                flexDirection: "row",
            }}>
                { headings.map(heading => (
                    <Typography 
                        variant="h3" 
                        sx={headingStyle(selectedHeading==heading.id)}
                        onClick={ () => { setSelectedHeading(heading.id)}}
                    >{heading.name}</Typography>
                ))}
            </Grid>
            <Box sx={{ mt: 4 }}>
                { getContent() }
            </Box>
        </>
    )
}