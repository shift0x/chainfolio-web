import { Button, CircularProgress } from "@mui/material";
import { useState } from "react";

export function EnqueueTransactionButton({...props}){
    return (
        <ActionButton content="Enqueue Transaction" {...props} />
    )
}

export function ActionButton({ content, active, onAction, onActionCompleted, sx={}, ...props }){
    const [isProcessingAction, setIsProcessingAction] = useState(false)
    const canSubmit = active && !isProcessingAction

    async function handleClick(){
        setIsProcessingAction(true);

        try {
            await onAction();
            
            setTimeout(() => {
                onActionCompleted();
            }, 1500)
        } catch(err){
            setIsProcessingAction(false);

            alert(err);
        }
    }

    function getButtonContent(){
        if(isProcessingAction){
            return (
                <>
                    <CircularProgress size="1rem" />&nbsp; {content}
                </>
            )
        }

        return content
    }

    return (
        <Button variant="contained" 
            onClick={handleClick}
            disabled={!canSubmit} 
            sx={{
                width: "100%",
                ...sx
            }} 
            color={ canSubmit ? "primary" : "info"} 
            {...props}
        >
                { getButtonContent() }
        </Button>
    )
}