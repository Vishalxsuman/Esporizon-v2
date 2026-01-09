import { Wallet, Transaction } from '@/types'

class WalletService {
  private getStorageKey(userId: string): string {
    return `espo_wallet_${userId}`
  }

  async getWallet(userId: string): Promise<Wallet> {
    const key = this.getStorageKey(userId)
    const stored = localStorage.getItem(key)
    if (stored) {
      const wallet = JSON.parse(stored)
      // Ensure espoCoins exists for backwards compatibility
      if (wallet.espoCoins === undefined) {
        wallet.espoCoins = 0
      }
      return wallet
    }
    const newWallet: Wallet = { balance: 0, espoCoins: 0, transactions: [] }
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
        currency: 'INR',
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
        currency: 'INR',
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
        currency: 'INR',
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

  // Add Espo Coins (for ad rewards, conversions, etc.)
  async addEspoCoins(amount: number, userId: string, description: string, metadata?: any): Promise<void> {
    try {
      const wallet = await this.getWallet(userId)
      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'ad_reward',
        amount: amount,
        currency: 'ESPO_COIN',
        description: description,
        timestamp: new Date().toISOString(),
        status: 'completed',
        metadata
      }

      wallet.espoCoins += amount
      wallet.transactions.unshift(newTransaction)

      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(wallet))
      window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }))
    } catch (error) {
      console.error('Error adding Espo Coins:', error)
      throw new Error('Failed to add Espo Coins')
    }
  }

  // Deduct Espo Coins (for match entry fees)
  async deductEspoCoins(amount: number, userId: string, description: string, metadata?: any): Promise<void> {
    try {
      const wallet = await this.getWallet(userId)
      if (wallet.espoCoins < amount) {
        throw new Error('Insufficient Espo Coins')
      }

      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'match_entry',
        amount: amount,
        currency: 'ESPO_COIN',
        description: description,
        timestamp: new Date().toISOString(),
        status: 'completed',
        metadata
      }

      wallet.espoCoins -= amount
      wallet.transactions.unshift(newTransaction)

      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(wallet))
      window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }))
    } catch (error) {
      console.error('Error deducting Espo Coins:', error)
      throw error
    }
  }

  // Credit match winnings
  async creditMatchWinnings(amount: number, userId: string, matchId: string): Promise<void> {
    try {
      const wallet = await this.getWallet(userId)
      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'match_win',
        amount: amount,
        currency: 'ESPO_COIN',
        description: `Match winnings`,
        timestamp: new Date().toISOString(),
        status: 'completed',
        metadata: { matchId }
      }

      wallet.espoCoins += amount
      wallet.transactions.unshift(newTransaction)

      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(wallet))
      window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }))
    } catch (error) {
      console.error('Error crediting match winnings:', error)
      throw new Error('Failed to credit match winnings')
    }
  }

  // Convert INR to Espo Coins (2.5 EC = ₹1)
  async convertINRToEspoCoins(inrAmount: number, userId: string): Promise<void> {
    try {
      const wallet = await this.getWallet(userId)
      if (wallet.balance < inrAmount) {
        throw new Error('Insufficient INR balance')
      }

      const espoCoins = inrAmount * 2.5

      // Deduct INR
      const deductTxn: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'deduct',
        amount: inrAmount,
        currency: 'INR',
        description: `Converted to ${espoCoins} Espo Coins`,
        timestamp: new Date().toISOString(),
        status: 'completed'
      }

      // Add Espo Coins
      const addTxn: Transaction = {
        id: `txn_${Date.now() + 1}`,
        type: 'add',
        amount: espoCoins,
        currency: 'ESPO_COIN',
        description: `Converted from ₹${inrAmount}`,
        timestamp: new Date().toISOString(),
        status: 'completed'
      }

      wallet.balance -= inrAmount
      wallet.espoCoins += espoCoins
      wallet.transactions.unshift(addTxn, deductTxn)

      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(wallet))
      window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }))
    } catch (error) {
      console.error('Error converting currency:', error)
      throw error
    }
  }
}

export const walletService = new WalletService()
