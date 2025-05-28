import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { UserList } from './UserList';
import { MessageNotification } from './MessageNotification';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
  isOnline: boolean;
  lastSeen: string | null;
}

export const ChatInterface = () => {
  const { user, token } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again later.",
          variant: "destructive",
        });
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token, toast]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!selectedUserId || !token) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/messages/${selectedUserId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setConversationMessages(data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchMessages();
  }, [selectedUserId, token, toast]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message: Message) => {
      if (message.senderId._id === selectedUserId || message.receiverId._id === selectedUserId) {
        setConversationMessages(prev => [...prev, message]);
      }
      
      // Show notification for messages from non-selected users
      if (message.senderId._id !== selectedUserId) {
        setLatestMessage(message);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket, selectedUserId]);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    // Clear notification if it's from the selected user
    if (latestMessage?.senderId._id === userId) {
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
        setConversationMessages(prev => [...prev, response.message]);
        setNewMessage('');
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  console.log(users);
  const selectedUser = users.find(u => u._id === selectedUserId);

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4 max-w-6xl mx-auto">
      {/* User List */}
      <div className="w-80 bg-card border rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Contacts</h2>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        <UserList
          users={users}
          selectedUserId={selectedUserId}
          onUserSelect={handleUserSelect}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-card border rounded-lg overflow-hidden flex flex-col">
        {selectedUser ? (
          <>
            <ChatHeader
              selectedUser={selectedUser}
              isOnline={onlineUsers.has(selectedUser._id)}
              isConnected={isConnected}
            />
            <ChatMessages
              messages={conversationMessages}
              currentUserId={user?._id}
            />
            <ChatInput
              value={newMessage}
              onChange={setNewMessage}
              onSend={handleSendMessage}
              isDisabled={!isConnected || isSending}
            />
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a contact to start chatting
          </div>
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
