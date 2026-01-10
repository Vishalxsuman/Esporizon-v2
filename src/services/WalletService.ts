
import { Wallet } from '@/types'
import { db } from '@/services/firebase'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import axios from 'axios'
import { getAuth } from "firebase/auth";

class WalletService {
  private activeListenerUnsubscribe: (() => void) | null = null;
  private currentUserId: string | null = null;

  // Helper to get token
  private async getToken(): Promise<string | null> {
    const auth = getAuth();
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  }

  async getWallet(userId: string): Promise<Wallet> {
    // 1. Return initial data via single fetch (fast)
    // 2. Setup background listener to keep app in sync via events
    this.setupRealtimeSync(userId);

    try {
      const walletRef = doc(db, 'prediction_wallets', userId);
      const snapshot = await getDoc(walletRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          balance: data.balance || 0,
          espoCoins: data.espoCoins || 0,
          transactions: []
        };
      }
      return { balance: 0, espoCoins: 0, transactions: [] };
    } catch (err) {
      console.error("Error fetching wallet:", err);
      return { balance: 0, espoCoins: 0, transactions: [] };
    }
  }

  private setupRealtimeSync(userId: string) {
    // Prevent multiple listeners for same user
    if (this.currentUserId === userId && this.activeListenerUnsubscribe) return;

    // Cleanup previous
    if (this.activeListenerUnsubscribe) {
      this.activeListenerUnsubscribe();
    }

    this.currentUserId = userId;
    const walletRef = doc(db, 'prediction_wallets', userId);

    // Start listening
    this.activeListenerUnsubscribe = onSnapshot(walletRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const wallet = {
          balance: data.balance || 0,
          espoCoins: data.espoCoins || 0,
          transactions: []
        };
        // DISPATCH EVENT so Dashboard.tsx updates automatically
        window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }));
      }
    });
  }

  async addFunds(amount: number, _userId: string): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error("Authentication required");

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      await axios.post(`${API_URL}/predict/wallet/deposit`, {
        amount: amount
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error adding funds:', error);
      throw new Error('Failed to deposit funds');
    }
  }

  // Placeholders for legacy interface compatibility
  async withdrawFunds(_amount: number, _userId: string, _accountDetails: any): Promise<void> { console.warn("Withdraw API not integrated"); }
  async addEspoCoins(_amount: number, _userId: string, _description: string): Promise<void> { }
  async deductEspoCoins(_amount: number, _userId: string, _description: string): Promise<void> { }
  async convertINRToEspoCoins(_inrAmount: number, _userId: string): Promise<void> { }

  // Helper for manual subscription if needed
  subscribeToWallet(userId: string, callback: (wallet: Wallet) => void): () => void {
    const walletRef = doc(db, 'prediction_wallets', userId);
    return onSnapshot(walletRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({ balance: data.balance || 0, espoCoins: data.espoCoins || 0, transactions: [] });
      }
    });
  }
}

export const walletService = new WalletService()
