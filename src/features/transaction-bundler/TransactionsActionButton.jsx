import { Badge } from '@mui/material';
import { StyledFab } from '../../components/StyledFab';
import { useTransactionQueue } from '../../providers/TransactionQueueProvider';

const defaultFloatingActionButtonStyle = {
    backgroundColor: "#f2f2f2",
    zIndex: 99
}

const defaultBadgeStyle = {
    '& .MuiBadge-badge': {
        right: 3,
        top: 5,
        padding: '0 4px',
        zIndex: 100
    }
}

export default function TransactionsActionButton({variant="extended", size="medium", sx={}, ...props }){
    const { queuedTransactions } = useTransactionQueue()

    return (
        <Badge badgeContent={queuedTransactions.length} color="primary" sx={defaultBadgeStyle}>
            <StyledFab disabled={queuedTransactions.length == 0} variant={variant} size={size} sx={{
                    ...defaultFloatingActionButtonStyle,
                    ...sx
                }} {...props}>
                Transactions
            </StyledFab>
        </Badge>
    )
}