import { api } from '@/services/api';

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

            const response = await api.post('/api/support/ticket', {
                firebaseUid,
                userId,
                ...ticketData
            });

            return response.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('SupportService.createTicket error:', error);

            }
            // Re-throw if it's our validation error, otherwise standard handling
            const message = error.response?.data?.message || error.message || 'Failed to create support ticket';
            throw new Error(message);
        }
    }

    /**
     * Get user's support tickets
     * @param firebaseUid - Firebase UID
     * @param userId - Optional MongoDB user ID
     */
    async getMyTickets(firebaseUid: string, userId?: string) {
        try {
            const params: any = {};
            if (firebaseUid) params.firebaseUid = firebaseUid;
            if (userId) params.userId = userId;

            const response = await api.get('/api/support/tickets', { params });
            return response.data;
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('SupportService.getMyTickets error:', error);

            }
            throw new Error('Failed to fetch support tickets');
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
