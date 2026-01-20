import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Pin, PinOff, Shield, Users, MessageSquare, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { tournamentService } from '@/services/TournamentService' // Import service

interface ChatMessage {
    _id: string; // Use _id from MongoDB
    id?: string; // Fallback
    userId: string
    userName: string
    userRole: string // 'host' | 'player'
    message: string
    createdAt: string // MongoDB timestamp
    timestamp?: string // Fallback
    isPinned: boolean
}

interface TournamentChatRoomProps {
    tournamentId: string
    tournamentName: string
    isAdmin?: boolean
}

const TournamentChatRoom = ({ tournamentId, tournamentName, isAdmin = false }: TournamentChatRoomProps) => {
    const { user } = useAuth()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(true)

    // Poll for messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await tournamentService.getChatMessages(tournamentId)
                // Only update if we got a valid array (fixes wipe on network error)
                if (data && Array.isArray(data)) {
                    setMessages(data)
                }
            } catch (error) {
                if (import.meta.env.MODE !== 'production') {

                    console.error('Failed to fetch messages', error);

                }
            } finally {
                setLoading(false)
            }
        }

        fetchMessages()
        // Poll every 3 seconds for near-realtime
        const interval = setInterval(fetchMessages, 3000)
        return () => clearInterval(interval)
    }, [tournamentId])

    useEffect(() => {
        // Only scroll if near bottom or initial load? For now, simple scroll on new message count change
        // optimization: check scroll position before scrolling
        scrollToBottom()
    }, [messages.length])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user) return

        setSending(true)
        const tempId = Date.now().toString();
        const tempMsg: ChatMessage = {
            _id: tempId,
            userId: user.uid || user.id || 'user',
            userName: user.displayName || 'Me',
            userRole: isAdmin ? 'host' : 'player',
            message: newMessage.trim(),
            createdAt: new Date().toISOString(),
            isPinned: false
        };

        // Optimistic update
        setMessages(prev => [...prev, tempMsg])
        setNewMessage('')

        try {
            await tournamentService.sendChatMessage(tournamentId, newMessage.trim())
            // Refetch will sync the real ID
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error sending message:', error);

            }
            // Remove optimistic message if fail? Or show error. keeping simple for now.
        } finally {
            setSending(false)
        }
    }

    const handlePinMessage = async (messageId: string) => {
        if (!isAdmin) return;

        try {
            // Optimistic update
            setMessages(prev => prev.map(msg =>
                (msg._id === messageId || msg.id === messageId) ? { ...msg, isPinned: !msg.isPinned } : msg
            ));

            await tournamentService.pinMessage(tournamentId, messageId);
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Error pinning message:', error);

            }
            // Revert on error?
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const pinnedMessages = messages.filter(m => m.isPinned)
    // Filter out pinned messages from regular stream? Or keep them? Usually chat keeps them but Pins are sticky header.
    // Let's keep them in stream but also show in header.
    const displayMessages = messages;

    return (
        <div className="bg-zinc-900/60 backdrop-blur-3xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-white/5 p-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Tournament Chat</h3>
                        <p className="text-xs text-zinc-500">{tournamentName}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-zinc-950/40 rounded-lg border border-white/5">
                        <Users className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs font-bold text-zinc-400">{messages.length}</span>
                    </div>
                </div>
            </div>

            {/* Pinned Messages Area */}
            {pinnedMessages.length > 0 && (
                <div className="bg-yellow-500/5 border-b border-yellow-500/20 p-4 shrink-0 max-h-[150px] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-3 sticky top-0 bg-transparent">
                        <Pin className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs font-black text-yellow-500 uppercase tracking-wider">
                            Pinned Messages
                        </span>
                    </div>
                    <div className="space-y-2">
                        {pinnedMessages.map((msg) => (
                            <div key={`pin-${msg._id || msg.id}`} className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-3 h-3 text-yellow-500" />
                                        <span className="text-xs font-bold text-yellow-500">{msg.userName}</span>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handlePinMessage(msg._id || msg.id!)}
                                            className="text-yellow-600 hover:text-yellow-500 transition-colors"
                                        >
                                            <PinOff className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth bg-zinc-950/20">
                {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-zinc-500 text-xs uppercase tracking-widest">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading Comms...
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {displayMessages.map((msg) => {
                            const isHostMsg = msg.userRole === 'host' || msg.userRole === 'admin';
                            return (
                                <motion.div
                                    key={msg._id || msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`group ${isHostMsg
                                        ? 'bg-teal-500/10 border border-teal-500/20 ml-auto max-w-[90%]'
                                        : 'bg-zinc-800/40 border border-white/5 mr-auto max-w-[90%]'
                                        } rounded-2xl p-3 hover:bg-opacity-100 transition-all`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            {isHostMsg && (
                                                <Shield className="w-3 h-3 text-teal-400" />
                                            )}
                                            <span className={`text-xs font-bold ${isHostMsg ? 'text-teal-400' : 'text-zinc-400'
                                                }`}>
                                                {msg.userName}
                                            </span>
                                            <span className="text-[9px] text-zinc-600">
                                                {new Date(msg.createdAt || msg.timestamp!).toLocaleTimeString('en-IN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        {isAdmin && !msg.isPinned && (
                                            <button
                                                onClick={() => handlePinMessage(msg._id || msg.id!)}
                                                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-teal-400 transition-all"
                                                title="Pin Message"
                                            >
                                                <Pin className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-white whitespace-pre-wrap leading-relaxed break-words">{msg.message}</p>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/5 p-4 bg-zinc-900/80 shrink-0">
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isAdmin ? "Type an announcement..." : "Type your message..."}
                            rows={1}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/30 transition-colors resize-none overflow-hidden"
                            maxLength={500}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="px-5 py-3 bg-teal-500 hover:bg-teal-400 rounded-xl font-black text-sm uppercase tracking-widest text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TournamentChatRoom
