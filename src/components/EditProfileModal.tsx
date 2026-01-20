import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, User, Upload, Loader, CheckCircle, CircleAlert, Image as ImageIcon, Globe, Languages, Gamepad2, Share2 } from 'lucide-react'
import { UserProfile } from '@/types'
import ProfileService from '@/services/ProfileService'
import toast from 'react-hot-toast'
import { uploadImage } from '@/utils/uploadImage'

interface EditProfileModalProps {
    isOpen: boolean
    onClose: () => void
    profile: UserProfile | null
    user: any | null
    onSave?: () => void
}

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'Malaysia', 'Other']
const LANGUAGES_LIST = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada']

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profile, user, onSave }) => {
    // Basic Info
    const [displayName, setDisplayName] = useState('')
    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')

    useEffect(() => {
        if (profile) {
            setDisplayName(String(profile.displayName || ''))
            setUsername(String(profile.username || ''))
            setBio(String(profile.bio || ''))
        } else if (user) {
            const u = user as any
            setDisplayName(String(u.displayName || u.fullName || ''))
        }
    }, [profile, user])

    // New Fields
    const [country, setCountry] = useState(profile?.country || 'India')
    const [location, setLocation] = useState(profile?.location || '')
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(profile?.languages || [])
    const [socialLinks, setSocialLinks] = useState({
        discord: profile?.socialLinks?.discord || '',
        twitter: profile?.socialLinks?.twitter || '',
        instagram: profile?.socialLinks?.instagram || '',
        youtube: profile?.socialLinks?.youtube || '',
        twitch: profile?.socialLinks?.twitch || ''
    })

    // Game IDs
    const [gameAccounts, setGameAccounts] = useState(profile?.gameAccounts || {})

    // Images
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    // Banner
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string | null>(null)

    // Status
    const [loading, setLoading] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)
    const [checkingUsername, setCheckingUsername] = useState(false)
    const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'invalid' | 'idle'>('idle')

    const fileInputRef = useRef<HTMLInputElement>(null)
    const bannerInputRef = useRef<HTMLInputElement>(null)

    // Username check logic
    useEffect(() => {
        if (!username || username === profile?.username) {
            setUsernameStatus(username === profile?.username ? 'available' : 'idle')
            setCheckingUsername(false)
            return
        }

        setCheckingUsername(true)
        const timer = setTimeout(async () => {
            if (username.length < 3) {
                setUsernameStatus('invalid')
                setCheckingUsername(false)
                return
            }
            try {
                // Simulated availability check
                setUsernameStatus('available')
            } catch (err) {
                if (import.meta.env.MODE !== 'production') {

                    console.error(err);

                }
            } finally {
                setCheckingUsername(false)
            }
        }, 800)
        return () => clearTimeout(timer)
    }, [username, profile])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Invalid file type')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image exceeds 5MB limit')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            if (type === 'avatar') {
                setAvatarFile(file)
                setAvatarPreview(reader.result as string)
            } else {
                setBannerFile(file)
                setBannerPreview(reader.result as string)
            }
        }
        reader.readAsDataURL(file)
    }

    const toggleLanguage = (lang: string) => {
        if (selectedLanguages.includes(lang)) {
            setSelectedLanguages(prev => prev.filter(l => l !== lang))
        } else {
            if (selectedLanguages.length >= 3) {
                toast.error('Max 3 languages allowed')
                return
            }
            setSelectedLanguages(prev => [...prev, lang])
        }
    }

    const handleSave = async () => {
        const userId = user?.id || user?.uid
        if (!userId) return
        if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
            toast.error('Identification Error: Username unavailable')
            return
        }

        setLoading(true)
        setUploadingImages(true)

        try {
            let uploadedAvatarUrl = undefined
            let uploadedBannerUrl = undefined

            // Upload Avatar
            if (avatarFile) {
                try {
                    uploadedAvatarUrl = await uploadImage(avatarFile)
                } catch (e) {
                    toast.error('Avatar upload failed')
                }
            }

            // Upload Banner
            if (bannerFile) {
                try {
                    uploadedBannerUrl = await uploadImage(bannerFile)
                } catch (e) {
                    toast.error('Banner upload failed')
                }
            }

            const updateData: any = {
                username: username.toLowerCase().trim(),
                displayName: displayName.trim(),
                bio,
                country,
                location,
                languages: selectedLanguages,
                socialLinks,
                gameAccounts
            }

            if (uploadedAvatarUrl) updateData.avatarUrl = uploadedAvatarUrl
            if (uploadedBannerUrl) updateData.bannerUrl = uploadedBannerUrl

            await ProfileService.updateProfile(user.uid || user.id, updateData, user.id)

            toast.success('Operational Profile Updated')
            if (onSave) onSave()
            onClose()
        } catch (err) {
            if (import.meta.env.MODE !== 'production') {

                console.error(err);

            }
            toast.error('Logistical Failure during Update')
        } finally {
            setLoading(false)
            setUploadingImages(false)
        }
    }

    const updateGameId = (game: keyof UserProfile['gameAccounts'], id: string) => {
        setGameAccounts(prev => ({ ...prev, [game]: id }))
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0a0e1a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-teal-500/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] italic text-white">Edit Combat Dossier</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

                            {/* Banner & Avatar Section */}
                            <div className="relative">
                                {/* Banner */}
                                <div className="h-32 w-full rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden relative group">
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                    ) : profile?.bannerUrl ? (
                                        <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full bg-[url('/grid.svg')] opacity-20" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => bannerInputRef.current?.click()}
                                            className="px-4 py-2 bg-black/50 backdrop-blur border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-500 hover:text-black transition-all flex items-center gap-2"
                                        >
                                            <Upload size={14} /> Change Banner
                                        </button>
                                    </div>
                                    <input type="file" ref={bannerInputRef} onChange={(e) => handleImageChange(e, 'banner')} accept="image/*" className="hidden" />
                                </div>

                                {/* Avatar */}
                                <div className="absolute -bottom-10 left-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-[2rem] bg-[#0a0e1a] p-1.5">
                                            <div className="w-full h-full rounded-[1.6rem] bg-zinc-800 overflow-hidden relative">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : user?.photoURL || profile?.avatarUrl ? (
                                                    <img src={user?.photoURL || profile?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><User className="text-zinc-600" /></div>
                                                )}
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                    <ImageIcon size={20} className="text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={(e) => handleImageChange(e, 'avatar')} accept="image/*" className="hidden" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Call Sign (Display Name)</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full bg-[#0E1424] border border-white/5 rounded-xl p-4 text-sm font-bold focus:border-teal-500/50 focus:outline-none transition-all placeholder:text-zinc-700"
                                            placeholder="Enter display name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Agent ID (@Username)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                className={`w-full bg-[#0E1424] border rounded-xl p-4 pr-12 text-sm font-bold focus:outline-none transition-all placeholder:text-zinc-700 ${usernameStatus === 'taken' ? 'border-red-500/50' :
                                                    usernameStatus === 'available' ? 'border-teal-500/50' : 'border-white/5'
                                                    }`}
                                                placeholder="unique_id"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                {checkingUsername ? <Loader className="w-4 h-4 animate-spin text-teal-500" /> :
                                                    usernameStatus === 'available' ? <CheckCircle className="w-4 h-4 text-teal-500" /> :
                                                        usernameStatus === 'taken' ? <CircleAlert className="w-4 h-4 text-red-500" /> : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Combat Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full bg-[#0E1424] border border-white/5 rounded-xl p-4 text-sm font-medium focus:border-teal-500/50 focus:outline-none transition-all h-24 resize-none placeholder:text-zinc-700"
                                        placeholder="Briefing regarding your skills and objectives..."
                                    />
                                </div>

                                {/* Demographics */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2"><Globe size={10} /> Region</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                className="w-full bg-[#0E1424] border border-white/5 rounded-xl p-4 text-sm font-bold focus:border-teal-500/50 focus:outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="City / State"
                                                className="w-full bg-[#0E1424] border border-white/5 rounded-xl p-4 text-sm font-bold focus:border-teal-500/50 focus:outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2"><Languages size={10} /> Languages (Max 3)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {LANGUAGES_LIST.map(lang => (
                                                <button
                                                    key={lang}
                                                    onClick={() => toggleLanguage(lang)}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${selectedLanguages.includes(lang)
                                                        ? 'bg-teal-500 text-black border-teal-500'
                                                        : 'bg-[#0E1424] text-zinc-500 border-white/5 hover:border-white/20'
                                                        }`}
                                                >
                                                    {lang}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Game IDs */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-400 ml-1 flex items-center gap-2">
                                        <Gamepad2 size={12} /> Tactical IDs
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['BGMI', 'Free Fire', 'Valorant', 'Minecraft'].map((game) => {
                                            const key = game.toLowerCase().replace(' ', '') as keyof UserProfile['gameAccounts']
                                            return (
                                                <div key={game} className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">{game}</label>
                                                    <input
                                                        type="text"
                                                        value={gameAccounts[key] || ''}
                                                        onChange={(e) => updateGameId(key, e.target.value)}
                                                        className="w-full bg-[#0E1424] border border-white/5 rounded-xl p-3 text-xs font-bold focus:border-teal-500/30 focus:outline-none transition-all placeholder:text-zinc-800"
                                                        placeholder={`Enter ID`}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-purple-400 ml-1 flex items-center gap-2">
                                        <Share2 size={12} /> Comms Uplinks
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {['Discord', 'Twitter', 'Instagram'].map((social) => {
                                            const key = social.toLowerCase() as keyof typeof socialLinks
                                            return (
                                                <div key={social} className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">{social}</label>
                                                    <input
                                                        type="text"
                                                        value={(socialLinks as any)[key]}
                                                        onChange={(e) => setSocialLinks(prev => ({ ...prev, [key]: e.target.value }))}
                                                        className="w-full bg-[#0E1424] border border-white/5 rounded-xl p-3 text-xs font-bold focus:border-purple-500/30 focus:outline-none transition-all placeholder:text-zinc-800"
                                                        placeholder="@handle"
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-black/20 flex gap-3 backdrop-blur-sm">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-4 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading || uploadingImages || checkingUsername || usernameStatus === 'taken' || usernameStatus === 'invalid'}
                                className="flex-[2] px-6 py-4 bg-teal-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                            >
                                {loading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save size={16} /> Save Dossier
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default EditProfileModal
