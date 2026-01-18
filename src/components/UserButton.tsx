import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User } from 'lucide-react'
import { useState } from 'react'

const UserButton = () => {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)

    const handleSignOut = async () => {
        await signOut()
        navigate('/auth')
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#7c3aed] flex items-center justify-center text-white font-bold hover:scale-105 transition-transform"
            >
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                    <span className="text-sm">{user?.displayName?.charAt(0).toUpperCase() || 'U'}</span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-[var(--border)]">
                            <p className="text-sm font-bold truncate">{user?.displayName || 'User'}</p>
                            <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                navigate('/profile')
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--glass)] text-sm transition-colors"
                        >
                            <User size={16} />
                            Profile
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-sm text-red-500 transition-colors"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default UserButton
