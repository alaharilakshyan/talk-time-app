
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './MessageBubble';
import { FloatingUserSidebar } from './FloatingUserSidebar';
import { MessageNotification } from './MessageNotification';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Send, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('receive_message', (message: Message) => {
      console.log('📥 New message received:', message);
      setMessages(prev => [...prev, message]);
      setLatestMessage(message);
      
      // Update unread count for sender
      setUsers(prev => prev.map(u => 
        u.id === message.senderId._id 
          ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
          : u
      ));
    });

    // Listen for user online status
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
    // Clear unread count for selected user
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, unreadCount: 0 } : u
    ));
    // Load conversation history - you can implement this
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const conversationMessages = messages.filter(
    msg => 
      (msg.senderId._id === selectedUserId && msg.receiverId === user?.id) ||
      (msg.senderId._id === user?.id && msg.receiverId === selectedUserId)
  );

  return (
    <div className="h-screen flex w-full bg-gradient-to-br from-orange-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Floating User Sidebar */}
      <FloatingUserSidebar 
        users={users}
        selectedUserId={selectedUserId}
        onUserSelect={handleUserSelect}
        isConnected={isConnected}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col ml-20">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900">
          {selectedUser ? (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-400 to-rose-400 text-white">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {selectedUser.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedUser.username}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUser.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ) : (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Select a user to start chatting
            </h3>
          )}
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <span className={cn(
              "text-sm",
              isConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            {selectedUserId ? (
              <div className="space-y-4">
                {conversationMessages.map((message) => (
                  <MessageBubble 
                    key={message._id} 
                    message={{
                      id: message._id,
                      senderId: message.senderId._id,
                      senderName: message.senderId.username,
                      text: message.text,
                      timestamp: new Date(message.createdAt),
                      isOwn: message.senderId._id === user?.id
                    }} 
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Card className="p-8 text-center border-orange-200 dark:border-orange-800">
                  <div className="text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      💬
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                    <p className="text-sm">Select a user from the floating sidebar to begin chatting</p>
                  </div>
                </Card>
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          {selectedUserId && (
            <div className="p-4 border-t border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900">
              <div className="flex items-center space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isConnected ? "Type a message..." : "Disconnected - cannot send messages"}
                  className="flex-1"
                  disabled={!isConnected || isSending}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!isConnected || isSending || !newMessage.trim()}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Notifications */}
      {latestMessage && user && (
        <MessageNotification 
          message={latestMessage} 
          currentUserId={user.id}
        />
      )}
    </div>
  );
};
