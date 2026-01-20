import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Send } from 'lucide-react'

interface HostRatingModalProps {
    isOpen: boolean
    onClose: () => void
    hostName: string
    hostId: string
    onSubmit: (rating: number, feedback: string) => void
}

const HostRatingModal = ({ isOpen, onClose, hostName, hostId: _hostId, onSubmit }: HostRatingModalProps) => {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please select a rating')
            return
        }

        setSubmitting(true)
        try {
            await onSubmit(rating, feedback)
            // Reset form
            setRating(0)
            setFeedback('')
            onClose()
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Failed to submit rating:', error);

            }
            alert('Failed to submit rating. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-white/5 p-6">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-zinc-800/50 border border-white/5 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-4 h-4 text-zinc-400" />
                            </button>

                            <h2 className="text-2xl font-black text-white italic pr-10">RATE HOST</h2>
                            <p className="text-sm font-bold text-zinc-400 mt-1">
                                How was your experience with {hostName}?
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Star Rating */}
                            <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">
                                    Your Rating
                                </label>
                                <div className="flex items-center justify-center gap-3 py-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-all transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating)
                                                    ? 'fill-yellow-500 text-yellow-500'
                                                    : 'text-zinc-700'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <p className="text-center text-sm font-bold text-teal-400 mt-2">
                                        {rating === 1 && 'Poor'}
                                        {rating === 2 && 'Fair'}
                                        {rating === 3 && 'Good'}
                                        {rating === 4 && 'Very Good'}
                                        {rating === 5 && 'Excellent'}
                                    </p>
                                )}
                            </div>

                            {/* Feedback Text */}
                            <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                                    Feedback (Optional)
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Share your experience with this host..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/30 transition-colors resize-none"
                                    maxLength={500}
                                />
                                <p className="text-xs text-zinc-600 mt-2 text-right">
                                    {feedback.length}/500 characters
                                </p>
                            </div>

                            {/* Guidelines */}
                            <div className="bg-zinc-800/30 rounded-xl p-4">
                                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">
                                    Rating Guidelines
                                </h4>
                                <ul className="space-y-1 text-xs text-zinc-400">
                                    <li>• Be honest and constructive</li>
                                    <li>• Rate based on tournament quality and fairness</li>
                                    <li>• Your feedback helps improve the platform</li>
                                </ul>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-white/5 p-6 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={rating === 0 || submitting}
                                className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 rounded-xl font-black text-sm uppercase tracking-widest text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default HostRatingModal
