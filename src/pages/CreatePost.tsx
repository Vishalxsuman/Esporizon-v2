import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Image as ImageIcon, Send, X, ShieldAlert, Cpu, Sparkles } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { postService } from '@/services/PostService'

const CreatePost = () => {
    const navigate = useNavigate()
    const [content, setContent] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check size: 500 KB limit
        if (file.size > 500 * 1024) {
            toast.error('Data Overflow: Image exceeds 500 KB limit', {
                style: {
                    background: '#18181b',
                    color: '#ff4b2b',
                    border: '1px solid rgba(255, 75, 43, 0.2)',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }
            })
            return
        }

        setImageFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const clearImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() && !imageFile) return

        setLoading(true)
        try {
            await postService.createPost(content, imageFile)
            toast.success('Transmission Successful: Signal Uplinked', {
                icon: '⚡',
                style: {
                    background: '#18181b',
                    color: '#00ffc2',
                    border: '1px solid rgba(0, 255, 194, 0.2)',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }
            })
            setTimeout(() => navigate('/social'), 1500)
        } catch (error: any) {
            console.error('Create post error:', error)

            // Specifically handle CORS/Network errors often seen with Storage
            if (error.code === 'storage/unauthorized') {
                toast.error('Security Protocol Error: Storage Access Denied (Check Rules)', {
                    duration: 5000
                })
            } else if (error.message?.includes('CORS') || error.name === 'FirebaseError') {
                toast.error('Network Protocol Error: Storage CORS settings need to be configured. See instructions.', {
                    duration: 6000
                })
            } else {
                toast.error(error.message || 'System Failure: Transmission Interrupted')
            }
            setLoading(false) // Ensure loading is reset
        }
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 py-12 flex flex-col items-center relative overflow-hidden">
            <Toaster position="top-center" />

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-[#00ffc2]/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[5%] w-64 h-64 bg-[#7c3aed]/20 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl z-10"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8 px-2">
                    <button
                        onClick={() => navigate('/social')}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                    </button>
                    <div className="text-right">
                        <h1 className="text-xl font-black italic uppercase tracking-tighter">New Transmission</h1>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Sector Social | Active Protocol</p>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bg-[#18181b] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 space-y-6">
                        {/* Status Bar */}
                        <div className="flex items-center gap-3 p-4 bg-black/40 border border-white/5 rounded-2xl">
                            <div className="p-2 bg-[#00ffc2]/10 rounded-lg">
                                <Cpu size={16} className="text-[#00ffc2]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Memory Integrity</p>
                                <div className="h-1 w-full bg-white/5 rounded-full mt-1 overflow-hidden">
                                    <motion.div
                                        animate={{ width: `${(content.length / 1000) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-[#00ffc2] to-[#7c3aed]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Text Input */}
                        <div className="relative">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Input tactical Intel or community report..."
                                className="w-full h-48 bg-transparent text-lg font-medium placeholder-gray-600 focus:outline-none resize-none custom-scrollbar"
                                maxLength={1000}
                                disabled={loading}
                            />
                            {content.length === 0 && (
                                <div className="absolute top-0 left-0 pointer-events-none opacity-20">
                                    <Sparkles size={40} className="text-[#00ffc2]" />
                                </div>
                            )}
                        </div>

                        {/* Image Preview Area */}
                        <AnimatePresence>
                            {imagePreview && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative rounded-3xl overflow-hidden aspect-video border border-white/10 group shadow-2xl"
                                >
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="p-4 bg-red-500 text-white rounded-full hover:scale-110 transition-all shadow-xl shadow-red-500/30"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                                        <ShieldAlert size={12} className="text-yellow-500" />
                                        <span className="text-[8px] font-black uppercase text-white">Visual Data Verified ( {Math.round(imageFile!.size / 1024)}KB )</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Actions Bar */}
                    <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                                className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-[#00ffc2]/30 text-gray-400 hover:text-[#00ffc2] transition-all flex items-center gap-3 group"
                            >
                                <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Visual Intel</span>
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (!content.trim() && !imageFile)}
                            className="flex items-center gap-3 px-8 py-4 bg-[#00ffc2] text-[#09090b] rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_0_30px_rgba(0,255,194,0.2)] hover:scale-[1.05] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-[#09090b]/20 border-t-[#09090b] rounded-full animate-spin" />
                                    Encrypting...
                                </>
                            ) : (
                                <>
                                    Broadcast Signal
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Info */}
                <div className="mt-8 text-center px-8">
                    <p className="text-[9px] text-gray-600 font-medium uppercase tracking-[0.2em] leading-relaxed">
                        By broadcasting this signal, you agree to the Tactical Engagement Rules and Community Standards of the Sector 7 Network.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default CreatePost
