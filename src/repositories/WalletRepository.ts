import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Wallet, Transaction } from '@/types'

class WalletRepository {
  async getWallet(userId: string): Promise<Wallet | null> {
    const walletDoc = await getDoc(doc(db, 'wallets', userId))
    if (!walletDoc.exists()) {
      return null
    }
    const data = walletDoc.data()
    return {
      balance: data.balance || 0,
      transactions: [],
    }
  }

  subscribeToWallet(userId: string, callback: (wallet: Wallet) => void) {
    return onSnapshot(doc(db, 'wallets', userId), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        callback({
          balance: data.balance || 0,
          transactions: [],
        })
      }
    })
  }

  async getTransactions(userId: string, limitCount: number = 20): Promise<Transaction[]> {
    const transactionsRef = collection(db, 'transactions')
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      // Map deposit/withdraw or use standardized types
      let type: 'add' | 'deduct' | 'withdraw' = 'add'
      if (data.type === 'withdraw') type = 'withdraw'
      else if (data.type === 'deduct') type = 'deduct'

      return {
        id: doc.id,
        type: type,
        amount: data.amount || 0,
        timestamp: data.timestamp?.toDate() || new Date(),
        description: data.description || (type === 'add' ? 'Funds Added' : 'Withdrawal'),
        status: data.status || 'completed',
        userId: data.userId || userId, // Keep for internal use if needed
      }
    }) as Transaction[]
  }
}

export const walletRepository = new WalletRepository()
