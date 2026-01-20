import { api } from '@/services/api';

export interface ResultAnalysis {
    _id: string;
    tournamentId: string;
    screenshotUrl: string;
    aiExtractedResults: Array<{
        username: string;
        rank: number;
        kills: number;
        points: number;
        confidence?: number;
    }>;
    aiConfidence: number;
    aiStatus: 'pending' | 'processing' | 'completed' | 'failed';
    reviewStatus: 'pending_review' | 'approved' | 'rejected' | 'needs_correction';
    adminEditedResults?: Array<{
        userId?: string;
        username: string;
        rank: number;
        kills: number;
        points: number;
        prizeWon?: number;
    }>;
    finalResults?: Array<{
        userId: string;
        username: string;
        rank: number;
        kills: number;
        points: number;
        prizeWon: number;
    }>;
    isPublished: boolean;
    createdAt: string;
}

class ResultAnalysisService {
    /**
     * Upload result screenshot and trigger AI analysis
     */
    async uploadResultScreenshot(
        tournamentId: string,
        hostFirebaseUid: string,
        screenshotBase64: string,
        screenshotUrl?: string
    ) {
        try {
            const response = await api.post('/api/results/upload', {
                tournamentId,
                hostFirebaseUid,
                screenshotBase64,
                screenshotUrl: screenshotUrl || ''
            });
            return response.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Upload screenshot error:', error);

            }
            const message = error.response?.data?.message || 'Failed to upload screenshot';
            throw new Error(message);
        }
    }

    /**
     * Get result analysis for a tournament
     */
    async getResultAnalysis(tournamentId: string) {
        try {
            const response = await api.get(`/api/results/tournament/${tournamentId}`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                return null; // No results yet
            }
            if (import.meta.env.MODE !== 'production') {

                console.error('Get result analysis error:', error);

            }
            throw new Error('Failed to fetch result analysis');
        }
    }

    /**
     * Get all pending results for admin review
     */
    async getPendingResults() {
        try {
            const response = await api.get('/api/results/admin/pending');
            return response.data;
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Get pending results error:', error);

            }
            throw new Error('Failed to fetch pending results');
        }
    }

    /**
     * Admin edits extracted results
     */
    async adminEditResults(
        resultAnalysisId: string,
        editedResults: Array<any>,
        adminNotes: string,
        adminUserId: string
    ) {
        try {
            const response = await api.put(`/api/results/admin/${resultAnalysisId}/edit`, {
                editedResults,
                adminNotes,
                adminUserId
            });
            return response.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Admin edit results error:', error);

            }
            const message = error.response?.data?.message || 'Failed to edit results';
            throw new Error(message);
        }
    }

    /**
     * Admin approves and publishes results
     */
    async adminApproveResults(
        resultAnalysisId: string,
        adminUserId: string,
        finalResults?: Array<any>
    ) {
        try {
            const response = await api.post(`/api/results/admin/${resultAnalysisId}/approve`, {
                adminUserId,
                finalResults
            });
            return response.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Admin approve results error:', error);

            }
            const message = error.response?.data?.message || 'Failed to approve results';
            throw new Error(message);
        }
    }

    /**
     * Admin rejects results
     */
    async adminRejectResults(
        resultAnalysisId: string,
        adminUserId: string,
        reason: string
    ) {
        try {
            const response = await api.post(`/api/results/admin/${resultAnalysisId}/reject`, {
                adminUserId,
                reason
            });
            return response.data;
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Admin reject results error:', error);

            }
            const message = error.response?.data?.message || 'Failed to reject results';
            throw new Error(message);
        }
    }

    /**
     * Convert image file to base64
     */
    async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

export default new ResultAnalysisService();
