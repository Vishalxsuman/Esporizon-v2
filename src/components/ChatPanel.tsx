import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, ChevronLeft, MoreVertical, MessageCircle } from 'lucide-react';
import ChatService, { ChatPreview, ChatMessage } from '@/services/ChatService';
import AvatarWithFrame from '@/components/AvatarWithFrame';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    initialActiveChat?: string | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, initialActiveChat }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [chats, setChats] = useState<ChatPreview[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null); // friendId
    const [activeChatId, setActiveChatId] = useState<string | null>(null); // chatId

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingChats, setLoadingChats] = useState(false);

    // For auto-scroll
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        if (isOpen) {
            loadChats();
            if (initialActiveChat) {
                setActiveChat(initialActiveChat);
            }
        } else {
            // Reset when closed
            setActiveChat(null);
        }
    }, [isOpen, initialActiveChat]);

    // Polling for messages (simple implementation)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOpen && activeChat) {
            // Load immediately
            loadMessages(activeChat); // friendId used for lookup
            interval = setInterval(() => {
                loadMessages(activeChat, true); // silent refresh
            }, 3000);
        } else if (isOpen) {
            interval = setInterval(() => {
                loadChats(true);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isOpen, activeChat]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadChats = async (silent = false) => {
        if (!silent) setLoadingChats(true);
        const data = await ChatService.getChats();
        setChats(data);
        if (!silent) setLoadingChats(false);
    };

    const loadMessages = async (friendId: string, silent = false) => {
        try {
            const data = await ChatService.getChatDetails(friendId);
            setMessages(data.messages);
            setActiveChatId(data.chatId);
            if (!silent) ChatService.markAsRead(data.chatId);
        } catch (err) {
            if (import.meta.env.MODE !== 'production') {

                console.error(err);

            }
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        const tempMsg: ChatMessage = {
            senderId: user?.uid || '',
            text: newMessage,
            createdAt: new Date().toISOString(),
            readBy: []
        };

        // Optimistic UI
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');

        const sent = await ChatService.sendMessage(activeChat, tempMsg.text, activeChatId || undefined);
        if (!sent) {
            // Revert on failure? For now just log
            if (import.meta.env.MODE !== 'production') {

                console.error("Message failed");

            }
        } else {
            // Reload to get server timestamp/ID
            loadMessages(activeChat, true);
        }
    };

    const openChat = (friendId: string) => {
        if (import.meta.env.MODE !== 'production') {

            console.log("Opening chat with:", friendId);

        }
        setActiveChat(friendId);
    };

    const backToGeneric = () => {
        setActiveChat(null);
        setActiveChatId(null);
        loadChats(); // refresh list
    };

    const getActiveFriendDetails = () => {
        return chats.find(c => c.friendId === activeChat);
    };

    const activeFriend = getActiveFriendDetails();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#0F1420] border-l border-white/10 z-[101] shadow-2xl flex flex-col"
                    >
                        {/* View Switcher based on Active Chat */}
                        {!activeChat ? (
                            // CHAT LIST VIEW
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0a0e1a]">
                                    <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
                                        <MessageCircle size={20} className="text-teal-500" />
                                        Comms Link
                                    </h2>
                                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="text-zinc-500" size={20} /></button>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                    {chats.length === 0 && !loadingChats ? (
                                        <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                                            <p className="text-xs uppercase tracking-widest font-bold">No active comms</p>
                                        </div>
                                    ) : (
                                        chats.map(chat => (
                                            <button
                                                key={chat._id}
                                                onClick={() => openChat(chat.friendId)}
                                                className="w-full p-4 hover:bg-white/5 rounded-xl flex items-center gap-4 transition-all group border-b border-white/5 last:border-0"
                                            >
                                                <AvatarWithFrame username={chat.friendUsername} rank={chat.friendRank} size="medium" />
                                                <div className="flex-1 text-left">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-white text-sm group-hover:text-teal-400 transition-colors">{chat.friendName || chat.friendUsername}</span>
                                                        <span className="text-[10px] text-zinc-600">
                                                            {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-white font-bold' : 'text-zinc-500'}`}>
                                                        {chat.lastMessage}
                                                    </p>
                                                </div>
                                                {chat.unreadCount > 0 && (
                                                    <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-[10px] font-black text-black">
                                                        {chat.unreadCount}
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            // ACTIVE CHAT VIEW
                            <div className="flex flex-col h-full bg-[#0F1420]">
                                {/* Chat Header */}
                                <div className="p-3 border-b border-white/5 flex items-center justify-between bg-[#0a0e1a]">
                                    <div className="flex items-center gap-3">
                                        <button onClick={backToGeneric} className="p-2 hover:bg-white/5 rounded-full text-zinc-400">
                                            <ChevronLeft size={20} />
                                        </button>
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${activeFriend?.friendUsername}`)}>
                                            <AvatarWithFrame username={activeFriend?.friendUsername || 'User'} rank={activeFriend?.friendRank || 'Rookie'} size="small" />
                                            <div>
                                                <h3 className="text-sm font-bold text-white leading-none">{activeFriend?.friendName || activeFriend?.friendUsername}</h3>
                                                <span className="text-[10px] text-teal-500 font-medium uppercase tracking-wider">Online</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-white/5 rounded-full text-zinc-400">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.senderId === user?.uid;
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`
                                                     max-w-[70%] p-3 rounded-2xl text-sm font-medium
                                                     ${isMe
                                                        ? 'bg-teal-500 text-black rounded-tr-none'
                                                        : 'bg-[#1a1f2e] text-zinc-300 border border-white/5 rounded-tl-none'
                                                    }
                                                 `}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-[#0a0e1a] border-t border-white/5">
                                    <form onSubmit={handleSend} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all placeholder:text-zinc-600 font-medium"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="p-3 bg-teal-500 text-black rounded-xl hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChatPanel;
