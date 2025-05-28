
import React, { useState, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { FloatingUserSidebar } from './FloatingUserSidebar';
import { MessageNotification } from './MessageNotification';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    username: string;
    avatar?: string;
  };
  receiverId: string;
  text: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  isOnline: boolean;
  avatar?: string;
  unreadCount?: number;
}

export const ChatInterface = () => {
  const { user } = useAuth();
  const { socket, isConnected, sendMessage } = useSocket();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([
    // Mock users for demo - replace with actual user fetching
    { id: '68372686819e9e000265abee', username: 'Alice', isOnline: true, unreadCount: 2 },
    { id: '68372686819e9e000265abef', username: 'Bob', isOnline: false, unreadCount: 0 },
    { id: '68372686819e9e000265abeg', username: 'Charlie', isOnline: true, unreadCount: 1 }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message: Message) => {
      console.log('📥 New message received:', message);
      setMessages(prev => [...prev, message]);
      setLatestMessage(message);
      
      setUsers(prev => prev.map(u => 
        u.id === message.senderId._id 
          ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
          : u
      ));
    });

    socket.on('user_online', ({ userId }: { userId: string }) => {
      console.log('🟢 User online:', userId);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isOnline: true } : u
      ));
    });

    socket.on('user_offline', ({ userId }: { userId: string }) => {
      console.log('🔴 User offline:', userId);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isOnline: false } : u
      ));
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_online');
      socket.off('user_offline');
    };
  }, [socket]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId || !isConnected || isSending) return;

    setIsSending(true);
    try {
      const message = await sendMessage(selectedUserId, newMessage.trim());
      setMessages(prev => [...prev, message as Message]);
      setNewMessage('');
      toast({
        title: "Message sent",
        description: "Your message was delivered successfully",
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, unreadCount: 0 } : u
    ));
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const conversationMessages = messages.filter(
    msg => 
      (msg.senderId._id === selectedUserId && msg.receiverId === user?.id) ||
      (msg.senderId._id === user?.id && msg.receiverId === selectedUserId)
  );

  return (
    <div className="h-screen flex w-full bg-gradient-to-br from-orange-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 relative">
      <FloatingUserSidebar 
        users={users}
        selectedUserId={selectedUserId}
        onUserSelect={handleUserSelect}
        isConnected={isConnected}
      />

      <div className="flex-1 flex flex-col ml-20">
        <ChatHeader 
          selectedUser={selectedUser}
          isConnected={isConnected}
        />

        <ChatMessages 
          selectedUserId={selectedUserId}
          conversationMessages={conversationMessages}
          currentUserId={user?.id}
        />

        <ChatInput 
          selectedUserId={selectedUserId}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          isConnected={isConnected}
          isSending={isSending}
          onSendMessage={handleSendMessage}
        />
      </div>

      {latestMessage && user && (
        <MessageNotification 
          message={latestMessage} 
          currentUserId={user.id}
        />
      )}
    </div>
  );
};
