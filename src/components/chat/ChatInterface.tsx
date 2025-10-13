import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { useMessageCache } from '@/hooks/useMessageCache';
import { useRefresher } from '@/hooks/useRefresher';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { UserList } from './UserList';
import { MessageNotification } from './MessageNotification';
import { EmptyChat } from './EmptyChat';
import { Badge } from '@/components/ui/badge';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    username: string;
    avatar: string;
  };
  receiverId: {
    _id: string;
    username: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
}

interface User {
  _id: string;
  username: string;
  avatar: string;
  email?: string;
  isOnline: boolean;
  lastSeen: string | null;
}

export const ChatInterface = () => {
  const { user, token } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket();
  const { toast } = useToast();
  const { refresh, isRefreshing } = useRefresher();
  const {
    getCachedMessages,
    setCachedMessages,
    addMessage,
    isLoading: isCacheLoading,
    setLoading: setCacheLoading,
    clearCache
  } = useMessageCache();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);

  const selectedUser = users.find(u => u._id === selectedUserId);
  const conversationMessages = selectedUserId && user 
    ? getCachedMessages(user.id, selectedUserId) 
    : [];

  // Fetch users
  const fetchUsers = async () => {
    if (!token) return;
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    setUsers(data);
  };

  // Fetch messages for selected user
  const fetchMessages = async (userId: string) => {
    if (!token || !user) return;
    
    setCacheLoading(user.id, userId, true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/${userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setCachedMessages(user.id, userId, data.messages);
    } finally {
      setCacheLoading(user.id, userId, false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (token) {
      fetchUsers().catch(error => {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again later.",
          variant: "destructive",
        });
      });
    }
  }, [token, toast]);

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUserId && user) {
      const cached = getCachedMessages(user.id, selectedUserId);
      if (cached.length === 0) {
        fetchMessages(selectedUserId).catch(error => {
          console.error('Error fetching messages:', error);
          toast({
            title: "Error",
            description: "Failed to load messages. Please try again later.",
            variant: "destructive",
          });
        });
      }
    }
  }, [selectedUserId, user, getCachedMessages, toast]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message: Message) => {
      console.log('Received message:', message);
      addMessage(message);
      
      // Show notification for messages from non-selected users
      if (message.senderId.id !== selectedUserId) {
        setLatestMessage(message);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket, selectedUserId, addMessage]);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    if (latestMessage?.senderId.id === userId) {
      setLatestMessage(null);
    }
  };

  const handleSendMessage = async () => {
    if (!socket || !selectedUserId || !newMessage.trim() || isSending) return;

    setIsSending(true);
    
    socket.emit('send_message', {
      receiverId: selectedUserId,
      text: newMessage.trim()
    }, (response: { success: boolean; message?: Message; error?: string }) => {
      setIsSending(false);
      
      if (response.success && response.message) {
        console.log('Message sent successfully:', response.message);
        addMessage(response.message);
        setNewMessage('');
      } else {
        console.error('Failed to send message:', response.error);
        toast({
          title: "Error",
          description: response.error || "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleRefresh = () => {
    refresh(async () => {
      await fetchUsers();
      if (selectedUserId) {
        await fetchMessages(selectedUserId);
      }
    });
  };

  const handleRefreshUsers = () => {
    refresh(fetchUsers, { showToast: false });
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-6 max-w-7xl mx-auto p-6">
      {/* User List */}
      <div className="w-80 bg-card/50 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <UserList
          users={users}
          selectedUserId={selectedUserId}
          onUserSelect={handleUserSelect}
          onlineUsers={onlineUsers}
          currentUserId={user.id}
          onRefresh={handleRefreshUsers}
          isRefreshing={isRefreshing}
        />
        
        <div className="p-4 border-t border-white/10">
          <Badge variant={isConnected ? "default" : "destructive"} className="w-full justify-center backdrop-blur-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-card/50 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {selectedUser ? (
          <>
            <ChatHeader
              selectedUser={selectedUser}
              isOnline={onlineUsers.has(selectedUser._id)}
              isConnected={isConnected}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
            <ChatMessages
              messages={conversationMessages}
              currentUserId={user.id}
              isLoading={isCacheLoading(user.id, selectedUserId!)}
            />
            <ChatInput
              value={newMessage}
              onChange={setNewMessage}
              onSend={handleSendMessage}
              isDisabled={!isConnected || isSending}
            />
          </>
        ) : (
          <EmptyChat />
        )}
      </div>

      {/* Message Notification */}
      {latestMessage && (
        <MessageNotification
          message={latestMessage}
          onClose={() => setLatestMessage(null)}
        />
      )}
    </div>
  );
};
