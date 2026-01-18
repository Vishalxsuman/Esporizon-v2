import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-hot-toast'

interface Transaction {
    id: string
    type: 'credit' | 'debit'
    amount: number
    description: string
    date: string
}

interface WalletContextType {
    balance: number
    addBalance: (amount: number) => Promise<boolean>
    deductBalance: (amount: number, description: string) => Promise<boolean>
    transactions: Transaction[]
    loading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [balance, setBalance] = useState(0)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    // Load wallet data from localStorage on mount
    useEffect(() => {
        const storedBalance = localStorage.getItem('wallet_balance')
        const storedTransactions = localStorage.getItem('wallet_transactions')

        if (storedBalance) setBalance(parseFloat(storedBalance))
        if (storedTransactions) setTransactions(JSON.parse(storedTransactions))

        // Listen for updates from WalletService
        const handleWalletUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail && detail.balance !== undefined) {
                setBalance(detail.balance);
                // We could also update transactions if provided
            }
        };

        window.addEventListener('walletUpdate', handleWalletUpdate);

        // Simulate initial fetch delay
        setTimeout(() => setLoading(false), 500)

        return () => {
            window.removeEventListener('walletUpdate', handleWalletUpdate);
        }
    }, [])

    const addBalance = async (amount: number): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newBalance = balance + amount
                const newTransaction: Transaction = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'credit',
                    amount,
                    description: 'Added funds to wallet',
                    date: new Date().toISOString()
                }

                setBalance(newBalance)
                setTransactions(prev => [newTransaction, ...prev])

                localStorage.setItem('wallet_balance', newBalance.toString())
                localStorage.setItem('wallet_transactions', JSON.stringify([newTransaction, ...transactions]))

                toast.success(`Successfully added ₹${amount}`)
                resolve(true)
            }, 1000)
        })
    }

    const deductBalance = async (amount: number, description: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (balance < amount) {
                    toast.error('Insufficient balance')
                    resolve(false)
                    return
                }

                const newBalance = balance - amount
                const newTransaction: Transaction = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'debit',
                    amount,
                    description,
                    date: new Date().toISOString()
                }

                setBalance(newBalance)
                setTransactions(prev => [newTransaction, ...prev])

                localStorage.setItem('wallet_balance', newBalance.toString())
                localStorage.setItem('wallet_transactions', JSON.stringify([newTransaction, ...transactions]))

                resolve(true)
            }, 1000)
        })
    }

    return (
        <WalletContext.Provider value={{ balance, addBalance, deductBalance, transactions, loading }}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => {
    const context = useContext(WalletContext)
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider')
    }
    return context
}
