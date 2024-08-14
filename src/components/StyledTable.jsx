import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box } from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: "#fff",
    '&:nth-of-type(odd)': {
        backgroundColor: "#f9f9f9",
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

function StyledTable({ headings, rows }){

    return (
        <TableContainer component={Paper} sx={{borderRadius: 1}}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        { headings.map((heading, index) => (
                            <StyledTableCell align={ index == 0 ? "left" : "right"}>{heading.name}</StyledTableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map(row => (
                        <StyledTableRow key={row.name}>
                            { headings.map((heading, index) => (
                                <StyledTableCell>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: index == 0 ? 'flex-start' : 'flex-end' }}
                                    >
                                        {row[heading.id]}
                                    </Box>
                                </StyledTableCell>
                            ))}
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

StyledTable.propTypes = {
    headings: PropTypes.arrayOf(PropTypes.object).isRequired,
    rows: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default StyledTable