import { endpoints } from '@/config/api';

export interface SupportTicketData {
    subject: string;
    message: string;
    category: 'Account Help' | 'Report Issue' | 'General Support' | 'Technical Issue' | 'Payment Issue';
}

export interface SupportTicket {
    id: string;
    subject: string;
    message: string;
    category: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    createdAt: string;
    updatedAt?: string;
}

class SupportService {
    /**
     * Create a new support ticket
     * @param firebaseUid - Firebase UID of the user
     * @param ticketData - Ticket details
     * @param userId - Optional MongoDB user ID
     */
    async createTicket(
        firebaseUid: string,
        ticketData: SupportTicketData,
        userId?: string
    ) {
        try {
            // Validate input
            if (!ticketData.subject || !ticketData.message) {
                throw new Error('Subject and message are required');
            }

            if (ticketData.subject.length > 200) {
                throw new Error('Subject must be 200 characters or less');
            }

            if (ticketData.message.length > 2000) {
                throw new Error('Message must be 2000 characters or less');
            }

            const response = await fetch(`${endpoints.baseURL}/api/support/ticket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebaseUid,
                    userId,
                    ...ticketData
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create support ticket');
            }

            return await response.json();
        } catch (error) {
            console.error('SupportService.createTicket error:', error);
            throw error;
        }
    }

    /**
     * Get user's support tickets
     * @param firebaseUid - Firebase UID
     * @param userId - Optional MongoDB user ID
     */
    async getMyTickets(firebaseUid: string, userId?: string) {
        try {
            const params = new URLSearchParams();
            if (firebaseUid) params.append('firebaseUid', firebaseUid);
            if (userId) params.append('userId', userId);

            const response = await fetch(
                `${endpoints.baseURL}/api/support/tickets?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch support tickets');
            }

            return await response.json();
        } catch (error) {
            console.error('SupportService.getMyTickets error:', error);
            throw error;
        }
    }

    /**
     * Validate ticket data before submission
     * @param ticketData - Ticket data to validate
     */
    validateTicketData(ticketData: Partial<SupportTicketData>): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (!ticketData.subject || ticketData.subject.trim().length === 0) {
            errors.push('Subject is required');
        } else if (ticketData.subject.length > 200) {
            errors.push('Subject must be 200 characters or less');
        }

        if (!ticketData.message || ticketData.message.trim().length === 0) {
            errors.push('Message is required');
        } else if (ticketData.message.length > 2000) {
            errors.push('Message must be 2000 characters or less');
        }

        if (!ticketData.category) {
            errors.push('Category is required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

export default new SupportService();
