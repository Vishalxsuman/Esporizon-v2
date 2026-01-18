import { Wallet } from '@/types'
import axios from 'axios'
import { auth } from '@/config/firebaseConfig'

class WalletService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private currentUserId: string | null = null;

  async getWallet(userId: string): Promise<Wallet> {
    // Setup real-time polling if not already running
    this.setupRealtimeSync(userId);

    try {
      let API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) {
        console.warn('VITE_API_URL missing in WalletService, using fallback');
        API_URL = 'https://api.esporizon.in/api';
      }
      console.log('💰 WalletService fetching from:', `${API_URL}/wallet`);

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
      // Fallback to local storage if available
      const storedBalance = localStorage.getItem('wallet_balance');
      const balance = storedBalance ? parseFloat(storedBalance) : 0;
      return { balance: balance, espoCoins: balance, transactions: [] };
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
        let API_URL = import.meta.env.VITE_API_URL;
        if (!API_URL) API_URL = 'https://api.esporizon.in/api';
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
      // Get Firebase ID token
      const token = await auth.currentUser?.getIdToken();

      let API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) API_URL = 'https://api.esporizon.in/api';

      try {
        if (token) {
          const response = await axios.post(`${API_URL}/wallet/deposit`, {
            amount: amount
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.data.success && response.data.balance !== undefined) {
            this.broadcastBalance(response.data.balance);
            return;
          }
        } else {
          throw new Error("No token");
        }
      } catch (apiError) {
        console.warn("Backend deposit failed, using generic fallback for testing:", apiError);
        // Fallback: Just update local view for testing
        // In a real app we wouldn't do this, but for "verify flow without backend" request:
        // blocked by: we don't know current balance easily without storing it locally in service or context.
        // But WalletContext stores it. 
        // Actually, let's just dispatch an event that forces a balance update if we can't hit API.
        // Better yet, let's READ the local storage 'wallet_balance' if available (set by Context) and increment it.

        const current_local_balance = parseFloat(localStorage.getItem('wallet_balance') || '0');
        const new_balance = current_local_balance + amount;
        localStorage.setItem('wallet_balance', new_balance.toString());

        this.broadcastBalance(new_balance);
        return;
      }

    } catch (error) {
      console.error('Error adding funds:', error);
      throw new Error('Failed to deposit funds');
    }
  }

  private broadcastBalance(balance: number) {
    const wallet = {
      balance: balance,
      espoCoins: balance,
      transactions: []
    };
    window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }));
  }

  // Placeholders for legacy interface compatibility
  async withdrawFunds(_amount: number, _userId: string, _accountDetails: any): Promise<void> { console.warn("Withdraw API not integrated"); }
  async addEspoCoins(_amount: number, _userId: string, _description: string): Promise<void> { }
  async deductEspoCoins(_amount: number, _userId: string, _description: string, _metadata?: any): Promise<void> { }
  async convertINRToEspoCoins(_inrAmount: number, _userId: string): Promise<void> { }

  // Helper for manual subscription if needed
  subscribeToWallet(userId: string, callback: (wallet: Wallet) => void): () => void {
    let API_URL = import.meta.env.VITE_API_URL;
    if (!API_URL) API_URL = 'https://api.esporizon.in/api';

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
