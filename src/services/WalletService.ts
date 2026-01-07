import { Wallet, Transaction } from '@/types'

class WalletService {
  private getStorageKey(userId: string): string {
    return `espo_wallet_${userId}`
  }

  async getWallet(userId: string): Promise<Wallet> {
    const key = this.getStorageKey(userId)
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
    const newWallet: Wallet = { balance: 0, transactions: [] }
    localStorage.setItem(key, JSON.stringify(newWallet))
    return newWallet
  }

  async addFunds(amount: number, userId: string): Promise<void> {
    try {
      const wallet = await this.getWallet(userId)
      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'add',
        amount: amount,
        description: 'Added funds to wallet',
        timestamp: new Date().toISOString(),
        status: 'completed'
      }

      wallet.balance += amount
      wallet.transactions.unshift(newTransaction)

      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(wallet))

      // Dispatch custom event for real-time-like behavior across tabs/components
      window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }))
    } catch (error) {
      console.error('Error adding funds:', error)
      throw new Error('Failed to add funds')
    }
  }

  async deductFunds(amount: number, userId: string, description?: string): Promise<void> {
    try {
      const wallet = await this.getWallet(userId)
      if (wallet.balance < amount) {
        throw new Error('Insufficient balance')
      }

      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'deduct',
        amount: amount,
        description: description || 'Deducted from wallet',
        timestamp: new Date().toISOString(),
        status: 'completed'
      }

      wallet.balance -= amount
      wallet.transactions.unshift(newTransaction)

      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(wallet))
      window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }))
    } catch (error) {
      console.error('Error deducting funds:', error)
      throw error
    }
  }

  async withdrawFunds(amount: number, userId: string, accountDetails: any): Promise<void> {
    try {
      const wallet = await this.getWallet(userId)
      if (wallet.balance < amount) {
        throw new Error('Insufficient balance')
      }

      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'withdraw',
        amount: amount,
        description: `Withdrawal to ${accountDetails.method || 'bank'}`,
        timestamp: new Date().toISOString(),
        status: 'pending'
      }

      wallet.balance -= amount
      wallet.transactions.unshift(newTransaction)

      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(wallet))
      window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }))
    } catch (error) {
      console.error('Error withdrawing funds:', error)
      throw error
    }
  }
}

export const walletService = new WalletService()
