import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { LogOut, Bell, Shield, Key, Mail, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const SettingsTab = () => {
    const { signOut, user } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await signOut();
            toast.success('Logged out successfully');
            navigate('/auth');
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Logout error:', error);

            }
            toast.error('Failed to logout');
        }
    };

    const settingSections = [
        {
            title: 'Account',
            items: [
                { icon: Mail, label: 'Email', value: user?.email, action: () => { } },
                { icon: Key, label: 'Change Password', action: () => toast('Password change flow coming soon', { icon: '🔒' }) },
            ]
        },
        {
            title: 'Preferences',
            items: [
                { icon: Bell, label: 'Notifications', value: 'On', action: () => { } },
                { icon: Shield, label: 'Privacy', action: () => { } },
            ]
        }
    ]

    return (
        <div className="space-y-8">
            {settingSections.map((section) => (
                <div key={section.title} className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 pl-2">
                        {section.title}
                    </h3>
                    <div className="bg-[#0E1424]/40 border border-white/5 rounded-2xl overflow-hidden">
                        {section.items.map((item, idx) => (
                            <button
                                key={item.label}
                                onClick={item.action}
                                className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${idx !== section.items.length - 1 ? 'border-b border-white/5' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                                        <item.icon size={16} />
                                    </div>
                                    <span className="text-sm font-bold text-zinc-200">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.value && <span className="text-xs text-zinc-500">{item.value}</span>}
                                    <ChevronRight size={14} className="text-zinc-600" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <button
                onClick={handleLogout}
                className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-xs tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
            >
                <LogOut size={16} />
                Logout Session
            </button>

            <div className="text-center pt-8">
                <p className="text-[10px] text-zinc-700 font-mono">VERSION 2.0.0-ALPHA</p>
                <p className="text-[10px] text-zinc-700 font-mono">ESPORIZON SYSTEMS</p>
            </div>
        </div>
    )
}

export default SettingsTab
