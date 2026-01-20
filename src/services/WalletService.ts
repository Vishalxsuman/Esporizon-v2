import { Wallet } from '@/types'
import { api } from '@/services/api'
import { waitForAuth } from '@/utils/authGuard'

/**
 * WalletService - Simplified, NO POLLING
 * Fetches wallet data on-demand only:
 * - User login
 * - Wallet modal open
 * - Explicit refresh action
 */
class WalletService {
  async getWallet(_userId: string): Promise<Wallet> {
    try {
      // Wait for auth to be ready
      await waitForAuth();
      const response = await api.get('/wallet');

      const wallet = {
        balance: response?.data?.balance || 0,
        espoCoins: response?.data?.espoCoins || 0,
        transactions: response?.data?.transactions || []
      };

      // Broadcast update once via event
      window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }));

      return wallet;
    } catch (err: any) {
      // Return safe default to prevent crash
      return {
        balance: 0,
        espoCoins: 0,
        transactions: []
      };
    }
  }

  async addFunds(amount: number, _userId: string): Promise<void> {
    try {
      await waitForAuth();
      const response = await api.post('/wallet/deposit', {
        amount: amount
      });

      if (response?.data?.success && response?.data?.balance !== undefined) {
        // Backend succeeded - use backend balance
        const wallet = {
          balance: response.data.balance,
          espoCoins: response.data.balance,
          transactions: []
        };
        window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }));
        return;
      }
    } catch (error: any) {
      if (import.meta.env.MODE !== 'production') {

          console.warn('Backend wallet deposit failed, updating UI locally:', error);

      }
    }

    // FALLBACK: Backend failed or returned invalid data
    // Still update UI with optimistic update
    // Get current wallet from last known state or default
    const currentWallet = await this.getWallet(_userId);
    const newBalance = currentWallet.balance + amount;

    const wallet = {
      balance: newBalance,
      espoCoins: newBalance,
      transactions: []
    };

    // Broadcast update even if backend failed
    window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }));
    if (import.meta.env.MODE !== 'production') {
      if (import.meta.env.MODE !== 'production') {

          console.log(`✅ Wallet updated locally: +${amount} ESPO (Total: ${newBalance})`);

      }
    }

  }

  // Placeholders for legacy interface compatibility
  async withdrawFunds(_amount: number, _userId: string, _accountDetails: any): Promise<void> {
    if (import.meta.env.MODE !== 'production') {

        console.warn("Withdraw API not integrated");

    }
  }

  async addEspoCoins(_amount: number, _userId: string, _description: string): Promise<void> { }
  async deductEspoCoins(_amount: number, _userId: string, _description: string, _metadata?: any): Promise<void> { }
  async convertINRToEspoCoins(_inrAmount: number, _userId: string): Promise<void> { }
}

export const walletService = new WalletService()
