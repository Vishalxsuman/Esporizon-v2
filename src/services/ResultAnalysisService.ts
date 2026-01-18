import { endpoints } from '@/config/api';

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
            const response = await fetch(`${endpoints.baseURL}/api/results/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tournamentId,
                    hostFirebaseUid,
                    screenshotBase64,
                    screenshotUrl: screenshotUrl || ''
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to upload screenshot');
            }

            return await response.json();
        } catch (error) {
            console.error('Upload screenshot error:', error);
            throw error;
        }
    }

    /**
     * Get result analysis for a tournament
     */
    async getResultAnalysis(tournamentId: string) {
        try {
            const response = await fetch(`${endpoints.baseURL}/api/results/tournament/${tournamentId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // No results yet
                }
                throw new Error('Failed to fetch result analysis');
            }

            return await response.json();
        } catch (error) {
            console.error('Get result analysis error:', error);
            throw error;
        }
    }

    /**
     * Get all pending results for admin review
     */
    async getPendingResults() {
        try {
            const response = await fetch(`${endpoints.baseURL}/api/results/admin/pending`);

            if (!response.ok) {
                throw new Error('Failed to fetch pending results');
            }

            return await response.json();
        } catch (error) {
            console.error('Get pending results error:', error);
            throw error;
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
            const response = await fetch(`${endpoints.baseURL}/api/results/admin/${resultAnalysisId}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    editedResults,
                    adminNotes,
                    adminUserId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to edit results');
            }

            return await response.json();
        } catch (error) {
            console.error('Admin edit results error:', error);
            throw error;
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
            const response = await fetch(`${endpoints.baseURL}/api/results/admin/${resultAnalysisId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminUserId,
                    finalResults
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to approve results');
            }

            return await response.json();
        } catch (error) {
            console.error('Admin approve results error:', error);
            throw error;
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
            const response = await fetch(`${endpoints.baseURL}/api/results/admin/${resultAnalysisId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminUserId,
                    reason
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to reject results');
            }

            return await response.json();
        } catch (error) {
            console.error('Admin reject results error:', error);
            throw error;
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
