import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, X, Loader2, Image as ImageIcon,
    CheckCircle2, XCircle, Clock
} from 'lucide-react';
import ResultAnalysisService, { ResultAnalysis } from '@/services/ResultAnalysisService';
import toast from 'react-hot-toast';

interface ResultUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    tournamentId: string;
    tournamentTitle: string;
    hostFirebaseUid: string;
    onSuccess?: () => void;
}

const ResultUploadModal = ({
    isOpen,
    onClose,
    tournamentId,
    tournamentTitle,
    hostFirebaseUid,
    onSuccess
}: ResultUploadModalProps) => {
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [resultAnalysis, setResultAnalysis] = useState<ResultAnalysis | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    // Check if results already exist
    useEffect(() => {
        if (isOpen) {
            checkExistingResults();
        }
    }, [isOpen, tournamentId]);

    const checkExistingResults = async () => {
        try {
            const existing = await ResultAnalysisService.getResultAnalysis(tournamentId);
            if (existing) {
                setResultAnalysis(existing);
                if (existing.aiStatus === 'processing') {
                    startPolling();
                }
            }
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error checking existing results:', error);

            }
        }
    };

    const startPolling = () => {
        setIsPolling(true);
        const interval = setInterval(async () => {
            try {
                const updated = await ResultAnalysisService.getResultAnalysis(tournamentId);
                if (updated) {
                    setResultAnalysis(updated);
                    if (updated.aiStatus !== 'processing') {
                        setIsPolling(false);
                        clearInterval(interval);
                    }
                }
            } catch (error) {
                if (import.meta.env.MODE !== 'production') {

                    console.error('Polling error:', error);

                }
            }
        }, 3000); // Poll every 3 seconds

        // Stop polling after 2 minutes
        setTimeout(() => {
            setIsPolling(false);
            clearInterval(interval);
        }, 120000);
    };

    const handleScreenshotSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error('Image must be smaller than 10MB');
            return;
        }

        setScreenshot(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setScreenshotPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!screenshot) {
            toast.error('Please select a screenshot');
            return;
        }

        setIsUploading(true);

        try {
            // Convert to base64
            const base64 = await ResultAnalysisService.fileToBase64(screenshot);

            // Upload and trigger AI analysis
            await ResultAnalysisService.uploadResultScreenshot(
                tournamentId,
                hostFirebaseUid,
                base64
            );

            toast.success('Screenshot uploaded! AI analysis in progress...');

            // Start polling for AI results
            startPolling();

            if (onSuccess) onSuccess();

        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Upload error:', error);

            }
            toast.error(error.message || 'Failed to upload screenshot');
        } finally {
            setIsUploading(false);
        }
    };

    const getStatusBadge = () => {
        if (!resultAnalysis) return null;

        const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
            pending: { label: 'Pending', color: 'bg-gray-500', icon: Clock },
            processing: { label: 'AI Processing...', color: 'bg-blue-500', icon: Loader2 },
            completed: { label: 'AI Completed', color: 'bg-green-500', icon: CheckCircle2 },
            failed: { label: 'AI Failed', color: 'bg-red-500', icon: XCircle }
        };

        const config = statusConfig[resultAnalysis.aiStatus] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color} text-white text-xs font-bold`}>
                <Icon size={14} className={resultAnalysis.aiStatus === 'processing' ? 'animate-spin' : ''} />
                {config.label}
            </div>
        );
    };

    const getReviewStatusBadge = () => {
        if (!resultAnalysis) return null;

        const reviewConfig: Record<string, { label: string; color: string }> = {
            pending_review: { label: 'Awaiting Admin Review', color: 'bg-yellow-500' },
            approved: { label: 'Approved & Published', color: 'bg-green-500' },
            rejected: { label: 'Rejected', color: 'bg-red-500' },
            needs_correction: { label: 'Needs Correction', color: 'bg-orange-500' }
        };

        const config = reviewConfig[resultAnalysis.reviewStatus] || reviewConfig.pending_review;

        return (
            <div className={`px-3 py-1.5 rounded-full ${config.color} text-white text-xs font-bold`}>
                {config.label}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-wide text-[var(--text-primary)]">
                                        Submit Results
                                    </h2>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">{tournamentTitle}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                                {/* Existing Results Status */}
                                {resultAnalysis && (
                                    <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                                                Result Status
                                            </h3>
                                            <div className="flex gap-2">
                                                {getStatusBadge()}
                                                {getReviewStatusBadge()}
                                            </div>
                                        </div>

                                        {/* AI Extracted Results */}
                                        {resultAnalysis.aiStatus === 'completed' && resultAnalysis.aiExtractedResults && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                                        AI Extracted Results
                                                    </h4>
                                                    <span className="text-xs text-[var(--text-secondary)]">
                                                        Confidence: {Math.round(resultAnalysis.aiConfidence * 100)}%
                                                    </span>
                                                </div>
                                                <div className="bg-[var(--surface)] rounded-lg p-3 space-y-2">
                                                    {resultAnalysis.aiExtractedResults.map((result, index) => (
                                                        <div key={index} className="flex items-center justify-between text-sm">
                                                            <span className="font-bold">
                                                                <span className="text-[var(--accent)]">#{result.rank}</span> {result.username}
                                                            </span>
                                                            <div className="flex gap-4 text-xs text-[var(--text-secondary)]">
                                                                <span>Kills: {result.kills}</span>
                                                                <span>Points: {result.points}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {resultAnalysis.isPublished && resultAnalysis.finalResults && (
                                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-green-500 text-sm font-bold mb-2">
                                                    <CheckCircle2 size={16} />
                                                    Results Published
                                                </div>
                                                <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                                                    {resultAnalysis.finalResults.slice(0, 3).map((result, index) => (
                                                        <div key={index}>
                                                            #{result.rank} {result.username} - ₹{result.prizeWon} won
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Upload Section (only if no results yet) */}
                                {!resultAnalysis && (
                                    <>
                                        {/* Instructions */}
                                        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg p-4">
                                            <h3 className="text-sm font-bold text-[var(--accent)] mb-2">Instructions</h3>
                                            <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                                                <li>Upload a clear screenshot of the final results screen</li>
                                                <li>Ensure player names, ranks, and scores are visible</li>
                                                <li>AI will automatically extract the data</li>
                                                <li>Results will be sent to admin for review before publishing</li>
                                            </ul>
                                        </div>

                                        {/* Screenshot Upload */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                                                Result Screenshot
                                            </label>

                                            {!screenshotPreview ? (
                                                <label className="block cursor-pointer">
                                                    <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center hover:border-[var(--accent)] transition-colors">
                                                        <ImageIcon size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
                                                        <p className="text-sm font-bold text-[var(--text-primary)] mb-1">
                                                            Click to upload screenshot
                                                        </p>
                                                        <p className="text-xs text-[var(--text-secondary)]">
                                                            PNG, JPG up to 10MB
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleScreenshotSelect(e.target.files[0])}
                                                        className="hidden"
                                                    />
                                                </label>
                                            ) : (
                                                <div className="relative">
                                                    <img
                                                        src={screenshotPreview}
                                                        alt="Result screenshot"
                                                        className="w-full rounded-xl border border-[var(--border)]"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            setScreenshot(null);
                                                            setScreenshotPreview(null);
                                                        }}
                                                        className="absolute top-2 right-2 p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <X size={16} className="text-white" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Upload Button */}
                                        <button
                                            onClick={handleUpload}
                                            disabled={!screenshot || isUploading}
                                            className="w-full px-6 py-4 bg-[var(--accent)] text-black rounded-xl font-bold uppercase text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Uploading & Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={18} />
                                                    Upload & Analyze Results
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}

                                {/* Polling Status */}
                                {isPolling && (
                                    <div className="flex items-center justify-center gap-3 py-4">
                                        <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
                                        <span className="text-sm text-[var(--text-secondary)]">
                                            AI is processing your screenshot...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ResultUploadModal;
