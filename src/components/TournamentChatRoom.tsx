import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Pin, PinOff, Shield, Users, MessageSquare } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ChatMessage {
    id: string
    userId: string
    userName: string
    message: string
    timestamp: string
    isAdmin: boolean
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

    useEffect(() => {
        // Initialize with sample messages
        const sampleMessages: ChatMessage[] = [
            {
                id: '1',
                userId: 'admin',
                userName: 'Tournament Admin',
                message: 'Welcome to the tournament chat! Room details will be shared here 10 minutes before match start.',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                isAdmin: true,
                isPinned: true
            },
            {
                id: '2',
                userId: 'admin',
                userName: 'Tournament Admin',
                message: '🎮 **ROOM DETAILS** 🎮\nRoom ID: 123456789\nPassword: ESPO2026\nServer: Asia\nMap: Bermuda\n\nJoin 5 minutes before start!',
                timestamp: new Date(Date.now() - 1800000).toISOString(),
                isAdmin: true,
                isPinned: true
            },
            {
                id: '3',
                userId: 'user1',
                userName: 'ProGamer123',
                message: 'Thanks! Ready to play!',
                timestamp: new Date(Date.now() - 900000).toISOString(),
                isAdmin: false,
                isPinned: false
            },
            {
                id: '4',
                userId: 'user2',
                userName: 'ElitePlayer',
                message: 'What time does the match start?',
                timestamp: new Date(Date.now() - 600000).toISOString(),
                isAdmin: false,
                isPinned: false
            },
            {
                id: '5',
                userId: 'admin',
                userName: 'Tournament Admin',
                message: 'Match starts at 6:00 PM IST. Join the room by 5:55 PM.',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                isAdmin: true,
                isPinned: false
            }
        ]
        setMessages(sampleMessages)
    }, [tournamentId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user) return

        setSending(true)
        try {
            const message: ChatMessage = {
                id: Date.now().toString(),
                userId: user.uid || user.id || 'user',
                userName: user.displayName || 'Anonymous',
                message: newMessage.trim(),
                timestamp: new Date().toISOString(),
                isAdmin: false,
                isPinned: false
            }

            setMessages([...messages, message])
            setNewMessage('')

            // In production, send to backend
            console.log('Sending message:', message)
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setSending(false)
        }
    }

    const handlePinMessage = (messageId: string) => {
        if (!isAdmin) return

        setMessages(messages.map(msg =>
            msg.id === messageId
                ? { ...msg, isPinned: !msg.isPinned }
                : msg
        ))
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const pinnedMessages = messages.filter(m => m.isPinned)
    const regularMessages = messages.filter(m => !m.isPinned)

    return (
        <div className="bg-zinc-900/60 backdrop-blur-3xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-white/5 p-4">
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
                        <span className="text-xs font-bold text-zinc-400">{messages.length + 10}</span>
                    </div>
                </div>
            </div>

            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
                <div className="bg-yellow-500/5 border-b border-yellow-500/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Pin className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs font-black text-yellow-500 uppercase tracking-wider">
                            Pinned Messages
                        </span>
                    </div>
                    <div className="space-y-2">
                        {pinnedMessages.map((msg) => (
                            <div key={msg.id} className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                        {msg.isAdmin && (
                                            <Shield className="w-3 h-3 text-yellow-500" />
                                        )}
                                        <span className="text-xs font-bold text-yellow-500">{msg.userName}</span>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handlePinMessage(msg.id)}
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

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-3 scroll-smooth">
                <AnimatePresence>
                    {regularMessages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`group ${msg.isAdmin
                                ? 'bg-teal-500/10 border border-teal-500/20'
                                : 'bg-zinc-950/40 border border-white/5'
                                } rounded-lg p-3 hover:bg-opacity-100 transition-all`}
                        >
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                    {msg.isAdmin && (
                                        <Shield className="w-3 h-3 text-teal-400" />
                                    )}
                                    <span className={`text-xs font-bold ${msg.isAdmin ? 'text-teal-400' : 'text-zinc-400'
                                        }`}>
                                        {msg.userName}
                                    </span>
                                    <span className="text-[10px] text-zinc-600">
                                        {new Date(msg.timestamp).toLocaleTimeString('en-IN', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                {isAdmin && !msg.isPinned && (
                                    <button
                                        onClick={() => handlePinMessage(msg.id)}
                                        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-teal-400 transition-all"
                                    >
                                        <Pin className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/5 p-4">
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            rows={2}
                            className="w-full px-4 py-2 bg-zinc-800/50 border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/30 transition-colors resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-zinc-600 mt-1 text-right">
                            {newMessage.length}/500
                        </p>
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="px-5 py-3 bg-teal-500 hover:bg-teal-400 rounded-xl font-black text-sm uppercase tracking-widest text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TournamentChatRoom
