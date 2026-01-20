import { api } from '@/services/api';

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
        try {
            const response = await api.post('/api/reports', data);
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to create report';
            throw new Error(message);
        }
    }

    /**
     * Get reports for host
     */
    async getReportsForHost(status?: string, page: number = 1, limit: number = 20) {
        try {
            const params: any = { page, limit };
            if (status) params.status = status;

            const response = await api.get('/api/reports/host', { params });
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to fetch reports');
        }
    }

    /**
     * Get reports for player
     */
    async getReportsForPlayer(status?: string, page: number = 1, limit: number = 20) {
        try {
            const params: any = { page, limit };
            if (status) params.status = status;

            const response = await api.get('/api/reports/player', { params });
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to fetch reports');
        }
    }

    /**
     * Get report details
     */
    async getReportDetails(reportId: string) {
        try {
            const response = await api.get(`/api/reports/${reportId}`);
            return response.data;
        } catch (error: any) {
            throw new Error('Failed to fetch report details');
        }
    }

    /**
     * Add reply to report
     */
    async addReply(reportId: string, message: string) {
        try {
            const response = await api.post(`/api/reports/${reportId}/reply`, { message });
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to add reply';
            throw new Error(message);
        }
    }

    /**
     * Update report status
     */
    async updateStatus(reportId: string, status: string) {
        try {
            const response = await api.patch(`/api/reports/${reportId}/status`, { status });
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update status';
            throw new Error(message);
        }
    }
}

export const reportService = new ReportServiceClass();
