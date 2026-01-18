import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import SupportService, { SupportTicketData } from '@/services/SupportService';
import toast from 'react-hot-toast';

interface CustomerSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    firebaseUid: string;
    userId?: string;
}

const CustomerSupportModal = ({
    isOpen,
    onClose,
    firebaseUid,
    userId
}: CustomerSupportModalProps) => {
    const [category, setCategory] = useState<SupportTicketData['category']>('General Support');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const validation = SupportService.validateTicketData({
            subject,
            message,
            category
        });

        if (!validation.valid) {
            validation.errors.forEach(error => toast.error(error));
            return;
        }

        setIsSubmitting(true);

        try {
            await SupportService.createTicket(
                firebaseUid,
                { subject, message, category },
                userId
            );

            toast.success('Support ticket submitted successfully!');

            // Reset form
            setSubject('');
            setMessage('');
            setCategory('General Support');
            onClose();
        } catch (error: any) {
            console.error('Submit ticket error:', error);
            toast.error(error.message || 'Failed to submit support ticket');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setSubject('');
            setMessage('');
            setCategory('General Support');
            onClose();
        }
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
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-gradient-to-r from-[var(--accent)]/5 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                                        <MessageSquare size={16} className="text-[var(--accent)]" />
                                    </div>
                                    <h2 className="text-lg font-black uppercase tracking-wide text-[var(--text-primary)]">
                                        Customer Support
                                    </h2>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                                        Issue Category
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            'Account Help',
                                            'Report Issue',
                                            'General Support',
                                            'Technical Issue',
                                            'Payment Issue'
                                        ].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat as SupportTicketData['category'])}
                                                disabled={isSubmitting}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${category === cat
                                                        ? 'bg-[var(--accent)] text-black'
                                                        : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/50'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                                        placeholder="Brief description of your issue"
                                        disabled={isSubmitting}
                                        maxLength={200}
                                        required
                                    />
                                    <div className="text-xs text-[var(--text-secondary)] mt-1 text-right">
                                        {subject.length}/200
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                                        placeholder="Please provide detailed information about your issue..."
                                        rows={5}
                                        maxLength={2000}
                                        disabled={isSubmitting}
                                        required
                                    />
                                    <div className="text-xs text-[var(--text-secondary)] mt-1 text-right">
                                        {message.length}/2000
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg p-3">
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                        Our support team will review your ticket and respond as soon as possible.
                                        You'll be able to track your ticket status in your profile.
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-3 bg-[var(--surface-hover)] rounded-lg text-[var(--text-primary)] font-bold uppercase text-sm tracking-wide hover:bg-[var(--border)] transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !subject || !message}
                                        className="flex-1 px-4 py-3 bg-[var(--accent)] rounded-lg text-black font-bold uppercase text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Submit Ticket
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CustomerSupportModal;
