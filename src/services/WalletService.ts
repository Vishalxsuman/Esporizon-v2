import { db } from '@/config/firebase'
import {
  doc,
  updateDoc,
  arrayUnion,
  increment,
  Timestamp,
  runTransaction
} from 'firebase/firestore'
import { Wallet } from '@/types'

class WalletService {
  async getWallet(_userId: string): Promise<Wallet> {
    // This logic is already handled by WalletRepository and real-time listeners in Dashboard
    return { balance: 0, transactions: [] }
  }

  async addFunds(amount: number, userId: string): Promise<void> {
    try {
      const walletRef = doc(db, 'wallets', userId)
      await updateDoc(walletRef, {
        balance: increment(amount),
        transactions: arrayUnion({
          id: `txn_${Date.now()}`,
          type: 'add',
          amount: amount,
          description: 'Added funds to wallet',
          timestamp: Timestamp.now()
        })
      })
    } catch (error) {
      console.error('Error adding funds:', error)
      throw new Error('Failed to add funds')
    }
  }

  async deductFunds(amount: number, userId: string, description?: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const walletRef = doc(db, 'wallets', userId)
        const walletDoc = await transaction.get(walletRef)

        if (!walletDoc.exists()) {
          throw new Error('Wallet not found')
        }

        const currentBalance = walletDoc.data().balance || 0
        if (currentBalance < amount) {
          throw new Error('Insufficient balance')
        }

        transaction.update(walletRef, {
          balance: increment(-amount),
          transactions: arrayUnion({
            id: `txn_${Date.now()}`,
            type: 'deduct',
            amount: amount,
            description: description || 'Deducted from wallet',
            timestamp: Timestamp.now()
          })
        })
      })
    } catch (error) {
      console.error('Error deducting funds:', error)
      throw error
    }
  }

  async withdrawFunds(amount: number, userId: string, accountDetails: any): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const walletRef = doc(db, 'wallets', userId)
        const walletDoc = await transaction.get(walletRef)

        if (!walletDoc.exists()) {
          throw new Error('Wallet not found')
        }

        const currentBalance = walletDoc.data().balance || 0
        if (currentBalance < amount) {
          throw new Error('Insufficient balance')
        }

        transaction.update(walletRef, {
          balance: increment(-amount),
          transactions: arrayUnion({
            id: `txn_${Date.now()}`,
            type: 'withdraw',
            amount: amount,
            description: `Withdrawal to ${accountDetails.method || 'bank'}`,
            timestamp: Timestamp.now(),
            status: 'pending'
          })
        })
      })
    } catch (error) {
      console.error('Error withdrawing funds:', error)
      throw error
    }
  }
}

export const walletService = new WalletService()
