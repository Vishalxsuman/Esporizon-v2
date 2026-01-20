import { api } from '@/services/api';

export interface ChatMessage {
    senderId: string;
    text: string;
    createdAt: string;
    readBy: string[];
}

export interface ChatPreview {
    _id: string;
    friendId: string;
    friendName: string;
    friendUsername: string;
    friendAvatar: string;
    friendRank: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

const ChatService = {
    // Get list of all chats
    async getChats(): Promise<ChatPreview[]> {
        try {
            const response = await api.get('/api/chats');
            return response.data;
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Failed to get chats:', error);

            }
            return [];
        }
    },

    // Get specific chat messages
    async getChatDetails(friendId: string): Promise<{ messages: ChatMessage[], chatId: string }> {
        try {
            const response = await api.get(`/api/chats/${friendId}`);
            return {
                messages: response.data.messages,
                chatId: response.data._id
            };
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Failed to get chat details:', error);

            }
            throw error;
        }
    },

    // Send message
    async sendMessage(friendId: string, text: string, chatId?: string): Promise<ChatMessage | null> {
        try {
            const response = await api.post('/api/chats/send', {
                friendId,
                text,
                chatId
            });
            return response.data;
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Failed to send message:', error);

            }
            return null;
        }
    },

    // Mark as read
    async markAsRead(chatId: string) {
        try {
            await api.post('/api/chats/read', { chatId });
        } catch (error) {
            // silent fail
        }
    }
};

export default ChatService;
