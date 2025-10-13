import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { MessageCircle } from 'lucide-react';

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

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentUserId,
  isLoading = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-3 sm:p-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-4">
          <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 mb-4 opacity-20" />
          <p className="text-base sm:text-lg">No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isCurrentUser={message.senderId._id === currentUserId}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </ScrollArea>
  );
};
