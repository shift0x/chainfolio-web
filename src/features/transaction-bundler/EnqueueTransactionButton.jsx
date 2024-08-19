import { ActionButton } from "../../components/ActionButton";

export function EnqueueTransactionButton({ sx={}, ...props}){
    return (
        <ActionButton content="Enqueue Transaction" {...props} sx={{ mt: 2, ...sx}} />
    )
}