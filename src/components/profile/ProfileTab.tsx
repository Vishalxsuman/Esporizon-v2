import { User, MapPin, Globe, Link as LinkIcon, Edit3 } from 'lucide-react'

interface ProfileTabProps {
    profile: any;
    user: any;
    onEdit: () => void;
    isOwnProfile: boolean;
}

const ProfileTab = ({ profile, user, onEdit, isOwnProfile }: ProfileTabProps) => {
    return (
        <div className="space-y-6">
            <div className="bg-[#0E1424]/40 border border-white/5 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Personal Intel</h3>
                    {isOwnProfile && (
                        <button
                            onClick={onEdit}
                            className="text-teal-400 hover:text-white transition-colors p-2 -mr-2 -mt-2"
                        >
                            <Edit3 size={16} />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-600">Display Name</label>
                        <div className="flex items-center gap-2 text-white font-medium">
                            <User size={14} className="text-zinc-500" />
                            {user.username}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-600">Location</label>
                        <div className="flex items-center gap-2 text-white font-medium">
                            <MapPin size={14} className="text-zinc-500" />
                            {profile.country || 'Unknown Sector'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-600">Languages</label>
                        <div className="flex items-center gap-2 text-white font-medium">
                            <Globe size={14} className="text-zinc-500" />
                            {profile.languages?.join(', ') || 'English'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-600">Date of Entry</label>
                        <div className="text-white font-medium">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Bio</h3>
                    <p className="text-sm text-zinc-300 italic leading-relaxed">
                        "{profile.bio || 'No bio available.'}"
                    </p>
                </div>
            </div>

            {profile.socialLinks && Object.keys(profile.socialLinks).filter(k => profile.socialLinks[k]).length > 0 && (
                <div className="bg-[#0E1424]/40 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Comms channels</h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(profile.socialLinks).map(([platform, link]: [string, any]) => {
                            if (!link) return null;

                            let Icon = LinkIcon;
                            const p = platform.toLowerCase();
                            if (p.includes('twitter') || p.includes('x')) Icon = LinkIcon; // Lucide Twitter is deprecated often, check version, otherwise use Link
                            if (p.includes('instagram')) Icon = LinkIcon;
                            if (p.includes('youtube')) Icon = LinkIcon;
                            // Actually, let's keep it simple with LinkIcon for now to avoid import errors if icons aren't available, 
                            // but capitalize the text properly.

                            return (
                                <a
                                    key={platform}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center gap-2"
                                >
                                    <Icon size={14} className="text-teal-400" />
                                    <span className="text-xs font-bold uppercase text-white">{platform}</span>
                                </a>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileTab
