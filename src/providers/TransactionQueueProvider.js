import { createContext, useContext, useState } from "react"

export const TransactionStatus = {
    Queued: "queued",
    Pending: "pending",
    Success: "success",
    Failure: "failure"
}

const TransactionQueueContext = createContext(null);

export const useTransactionQueue = () => {
    const context = useContext(TransactionQueueContext)

    return context;
}

export const TransactionQueueProvider = ({children}) => {
    const [queuedTransactions, setQueuedTransactions] = useState([]);

    const addQueuedTransaction = (args) => {
        const tx = {
        id: queuedTransactions.length,
        status: TransactionStatus.Queued,
        args: args
        }

        setQueuedTransactions(prev => [...prev, tx])
    }

    const removeQueuedTransaction = (tx) => {
        setQueuedTransactions(prev => { 
            return prev.filter(transaction => {
                return transaction.id != tx.id
            })
        })
    }

    const value = {
        queuedTransactions,
        addQueuedTransaction,
        removeQueuedTransaction
    }

    return (
        <TransactionQueueContext.Provider value={value}>
            {children}
        </TransactionQueueContext.Provider>
    )
}
