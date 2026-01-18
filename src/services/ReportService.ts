import { auth } from '../config/firebaseConfig';
import { API_URL } from '@/config/api';

interface CreateReportData {
    tournamentId: string;
    issueType: string;
    subject: string;
    message: string;
}

class ReportServiceClass {
    /**
     * Create a new report
     */
    async createReport(data: CreateReportData) {
        const token = await auth?.currentUser?.getIdToken();

        const response = await fetch(`${API_URL}/api/reports`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create report');
        }

        return await response.json();
    }

    /**
     * Get reports for host
     */
    async getReportsForHost(status?: string, page: number = 1, limit: number = 20) {
        const token = await auth?.currentUser?.getIdToken();

        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(status && { status })
        });

        const response = await fetch(`${API_URL}/api/reports/host?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch reports');
        }

        return await response.json();
    }

    /**
     * Get reports for player
     */
    async getReportsForPlayer(status?: string, page: number = 1, limit: number = 20) {
        const token = await auth?.currentUser?.getIdToken();

        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(status && { status })
        });

        const response = await fetch(`${API_URL}/api/reports/player?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch reports');
        }

        return await response.json();
    }

    /**
     * Get report details
     */
    async getReportDetails(reportId: string) {
        const token = await auth?.currentUser?.getIdToken();

        const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch report details');
        }

        return await response.json();
    }

    /**
     * Add reply to report
     */
    async addReply(reportId: string, message: string) {
        const token = await auth?.currentUser?.getIdToken();

        const response = await fetch(`${API_URL}/api/reports/${reportId}/reply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add reply');
        }

        return await response.json();
    }

    /**
     * Update report status
     */
    async updateStatus(reportId: string, status: string) {
        const token = await auth?.currentUser?.getIdToken();

        const response = await fetch(`${API_URL}/api/reports/${reportId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update status');
        }

        return await response.json();
    }
}

export const reportService = new ReportServiceClass();
