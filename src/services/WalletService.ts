
import { Wallet } from '@/types'
import axios from 'axios'

class WalletService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private currentUserId: string | null = null;

  async getWallet(userId: string): Promise<Wallet> {
    // Setup real-time polling if not already running
    this.setupRealtimeSync(userId);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) {
        throw new Error('VITE_API_URL is not configured!');
      }

      const response = await axios.get(`${API_URL}/wallet`, {
        headers: {
          'user-id': userId
        }
      });

      return {
        balance: response.data.balance || 0,
        espoCoins: response.data.balance || 0, // ESPO coins = balance
        transactions: []
      };
    } catch (err) {
      console.error("Error fetching wallet from backend:", err);
      return { balance: 0, espoCoins: 0, transactions: [] };
    }
  }

  private setupRealtimeSync(userId: string) {
    // Prevent multiple poll loops for same user
    if (this.currentUserId === userId && this.pollingInterval) return;

    // Cleanup previous
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.currentUserId = userId;

    // Poll backend every 5 seconds
    this.pollingInterval = setInterval(async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_URL}/wallet`, {
          headers: { 'user-id': userId }
        });

        const wallet = {
          balance: response.data.balance || 0,
          espoCoins: response.data.balance || 0,
          transactions: []
        };

        // DISPATCH EVENT so Dashboard/other components update automatically
        window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }));
      } catch (error) {
        console.error('Wallet polling error:', error);
      }
    }, 5000);
  }

  async addFunds(amount: number, _userId: string): Promise<void> {
    try {
      // Get Clerk token
      const token = await (window as any).Clerk?.session?.getToken({ template: "firebase" });
      if (!token) throw new Error("Authentication required - please login");

      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) {
        throw new Error('VITE_API_URL is not configured!');
      }

      const response = await axios.post(`${API_URL}/predict/wallet/deposit`, {
        amount: amount
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update balance immediately if response includes it
      if (response.data.success && response.data.balance !== undefined) {
        const wallet = {
          balance: response.data.balance,
          espoCoins: response.data.balance,
          transactions: []
        };
        window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }));
      }
    } catch (error) {
      console.error('Error adding funds:', error);
      throw new Error('Failed to deposit funds');
    }
  }

  // Placeholders for legacy interface compatibility
  async withdrawFunds(_amount: number, _userId: string, _accountDetails: any): Promise<void> { console.warn("Withdraw API not integrated"); }
  async addEspoCoins(_amount: number, _userId: string, _description: string): Promise<void> { }
  async deductEspoCoins(_amount: number, _userId: string, _description: string, _metadata?: any): Promise<void> { }
  async convertINRToEspoCoins(_inrAmount: number, _userId: string): Promise<void> { }

  // Helper for manual subscription if needed
  subscribeToWallet(userId: string, callback: (wallet: Wallet) => void): () => void {
    const API_URL = import.meta.env.VITE_API_URL;

    const pollWallet = async () => {
      try {
        const response = await axios.get(`${API_URL}/wallet`, {
          headers: { 'user-id': userId }
        });
        callback({
          balance: response.data.balance || 0,
          espoCoins: response.data.balance || 0,
          transactions: []
        });
      } catch (error) {
        console.error('Wallet subscription error:', error);
      }
    };

    pollWallet(); // Initial fetch
    const interval = setInterval(pollWallet, 5000);

    return () => clearInterval(interval);
  }
}

export const walletService = new WalletService()
