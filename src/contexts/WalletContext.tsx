import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from './AuthContext'
import { walletService } from '@/services/WalletService'

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
    refreshWallet: () => Promise<void>
    transactions: Transaction[]
    loading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [balance, setBalance] = useState(0)
    const [transactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    const { user, authReady } = useAuth()

    const loadWallet = async () => {
        if (!user) return
        try {
            const data = await walletService.getWallet(user.id)
            if (data) {
                setBalance(data.balance)
                // setTransactions(data.transactions || []) 
            }
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Failed to load wallet:', error);

            }
        }
    }

    // Load wallet data from API when auth is ready
    useEffect(() => {
        if (!authReady || !user) {
            setLoading(false)
            return
        }

        loadWallet().finally(() => setLoading(false))

        // Listen for updates from WalletService
        const handleWalletUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail && detail.balance !== undefined) {
                setBalance(detail.balance);
            }
        };

        window.addEventListener('walletUpdate', handleWalletUpdate);
        return () => window.removeEventListener('walletUpdate', handleWalletUpdate);
    }, [authReady, user?.id])

    const refreshWallet = async () => {
        await loadWallet()
    }

    const addBalance = async (amount: number): Promise<boolean> => {
        if (!user) return false;

        try {
            await walletService.addFunds(amount, user.id)
            await loadWallet() // Reliable refresh
            toast.success(`Successfully added ₹${amount}`)
            return true
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Add balance error:', error);

            }
            toast.error('Failed to add funds')
            return false
        }
    }

    const deductBalance = async (_amount: number, _description: string): Promise<boolean> => {
        // ... existing mock/logic ...
        // Keeping it for now but suggesting refresh instead for real transactions
        const res = true // mocked
        if (res) await loadWallet()
        return res
    }

    return (
        <WalletContext.Provider value={{ balance, addBalance, deductBalance, refreshWallet, transactions, loading }}>
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
