import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, X, Globe, Lock, Send, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { postService } from '@/services/PostService'
import { uploadImage } from '@/utils/uploadImage'
import toast from 'react-hot-toast'

const CreatePostCard = () => {
    const { user } = useAuth()
    const [content, setContent] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [visibility, setVisibility] = useState<'public' | 'private'>('public')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const clearImage = () => {
        setImage(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !content.trim()) return

        setIsSubmitting(true)
        try {
            let imageUrl = null
            if (image) {
                imageUrl = await uploadImage(image)
            }

            await postService.createPost(
                content,
                imageUrl,
                user.id,
                user.displayName || 'Anonymous',
                user.photoURL || '',
                visibility
            )

            setContent('')
            clearImage()
            toast.success('Posted Successfully')
        } catch (error) {
            toast.error('Failed to post')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-3xl border border-[var(--border)] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group"
        >
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1rem] bg-[var(--accent)]/10 p-[1px] border border-[var(--border)] overflow-hidden">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-black flex items-center justify-center text-[var(--accent)] font-black text-xs">U</div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">New Post</h3>
                                <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em]">@{user?.displayName || 'user'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                            <span className="text-[8px] font-black text-[var(--accent)] uppercase tracking-widest">Ready</span>
                        </div>
                    </div>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full bg-transparent border-none focus:ring-0 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 resize-none py-2 text-sm min-h-[100px] custom-scrollbar font-medium tracking-tight"
                        disabled={isSubmitting}
                    />
                </div>

                <AnimatePresence>
                    {imagePreview && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative rounded-[1.5rem] overflow-hidden border border-[var(--border)] aspect-video group/img shadow-2xl"
                        >
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/10" />
                            <button
                                type="button"
                                onClick={clearImage}
                                className="absolute top-4 right-4 p-2 bg-black/80 backdrop-blur-md rounded-xl text-white hover:bg-red-500 transition-all opacity-0 group-hover/img:opacity-100 shadow-xl border border-white/10"
                            >
                                <X size={18} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[var(--border)]">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-4 bg-[var(--glass)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] rounded-2xl transition-all border border-[var(--border)] hover:border-[var(--accent)] shadow-lg relative overflow-hidden group/btn"
                            title="Add Photo"
                        >
                            <Image size={20} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />

                        <div className="flex bg-[var(--glass)] p-1.5 rounded-2xl border border-[var(--border)] w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setVisibility('public')}
                                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${visibility === 'public'
                                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-[0_0_20px_rgba(0,255,194,0.4)]'
                                    : 'text-[var(--text-secondary)] hover:text-white'
                                    }`}
                            >
                                <Globe size={14} />
                                PUBLIC
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisibility('private')}
                                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${visibility === 'private'
                                    ? 'bg-white text-[var(--bg-primary)] shadow-[0_0_25px_rgba(255,255,255,0.2)]'
                                    : 'text-[var(--text-secondary)] hover:text-white'
                                    }`}
                            >
                                <Lock size={14} />
                                PRIVATE
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="w-full sm:w-auto px-10 py-4 bg-[var(--accent)] text-[var(--bg-primary)] rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,255,194,0.3)] disabled:opacity-50 disabled:hover:scale-100 group/submit relative overflow-hidden"
                    >
                        {isSubmitting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <Send size={16} />
                                <span>POST NOW</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    )
}

export default CreatePostCard
