import { MessageSquare, FileText, Mail, ExternalLink } from 'lucide-react'

const HelpTab = () => {
    const supportOptions = [
        {
            icon: MessageSquare,
            title: 'Live Chat Support',
            description: 'Connect with a support agent for immediate assistance.',
            action: 'Start Chat',
            color: 'text-teal-400',
            bg: 'bg-teal-500/10',
            border: 'border-teal-500/20'
        },
        {
            icon: FileText,
            title: 'FAQs & Guides',
            description: 'Browse our knowledge base for quick answers.',
            action: 'Browse Articles',
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        {
            icon: Mail,
            title: 'Email Support',
            description: 'Send us a detailed message about your issue.',
            action: 'Send Email',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        }
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {supportOptions.map((option, idx) => (
                    <div
                        key={idx}
                        className={`p-6 rounded-2xl border ${option.border} ${option.bg} hover:bg-opacity-20 transition-all group cursor-pointer`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-[#0a0e1a]/40 flex items-center justify-center border border-white/5`}>
                                <option.icon size={24} className={option.color} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">{option.title}</h3>
                                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{option.description}</p>
                                <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${option.color}`}>
                                    {option.action} <ExternalLink size={10} />
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center pt-8 border-t border-white/5">
                <p className="text-xs text-zinc-500 mb-2">Still need help?</p>
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white/5 px-4 py-2 rounded-full">
                    Support ID: <span className="text-white">USER-882-991</span>
                </div>
            </div>
        </div>
    )
}

export default HelpTab
