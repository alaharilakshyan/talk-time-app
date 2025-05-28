
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserList } from './UserList';
import { MessageBubble } from './MessageBubble';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}

interface User {
  id: string;
  username: string;
  isOnline: boolean;
  avatar?: string;
}

export const ChatInterface = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
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
    socket.on('newMessage', (message: any) => {
      const formattedMessage: Message = {
        id: message.id || Date.now().toString(),
        senderId: message.senderId,
        senderName: message.senderName,
        text: message.text,
        timestamp: new Date(message.timestamp),
        isOwn: message.senderId === user?.id
      };
      setMessages(prev => [...prev, formattedMessage]);
    });

    // Listen for user list updates
    socket.on('userListUpdate', (userList: User[]) => {
      setUsers(userList.filter(u => u.id !== user?.id));
    });

    // Listen for user online status changes
    socket.on('userOnlineStatus', ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isOnline } : u));
    });

    return () => {
      socket.off('newMessage');
      socket.off('userListUpdate');
      socket.off('userOnlineStatus');
    };
  }, [socket, user?.id]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUserId || !socket) return;

    const messageData = {
      receiverId: selectedUserId,
      text: newMessage.trim(),
      senderId: user?.id,
      senderName: user?.username,
      timestamp: new Date()
    };

    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    // Load conversation history when switching users
    if (socket) {
      socket.emit('loadConversation', { userId });
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const conversationMessages = messages.filter(
    msg => msg.senderId === selectedUserId || 
           (msg.senderId === user?.id && selectedUserId)
  );

  return (
    <div className="h-screen flex w-full bg-gradient-to-br from-orange-50 to-rose-50 dark:from-gray-900 dark:to-gray-800">
      <SidebarProvider>
        {/* Users Sidebar */}
        <Sidebar className="w-80 border-r border-orange-200 dark:border-orange-800">
          <SidebarContent className="bg-white dark:bg-gray-900">
            <div className="p-4 border-b border-orange-200 dark:border-orange-800">
              <h2 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                Messages
              </h2>
            </div>
            <UserList 
              users={users}
              selectedUserId={selectedUserId}
              onUserSelect={handleUserSelect}
            />
          </SidebarContent>
        </Sidebar>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center p-4 border-b border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900">
            <SidebarTrigger className="mr-4 md:hidden" />
            {selectedUser ? (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
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
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              {selectedUserId ? (
                <div className="space-y-4">
                  {conversationMessages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
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
                      <p className="text-sm">Select a user from the sidebar to begin chatting</p>
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
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};
