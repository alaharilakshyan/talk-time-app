
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { EmptyChat } from './EmptyChat';

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

interface ChatMessagesProps {
  selectedUserId: string | null;
  conversationMessages: Message[];
  currentUserId: string | undefined;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  selectedUserId, 
  conversationMessages, 
  currentUserId 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  return (
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
                  isOwn: message.senderId._id === currentUserId
                }} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <EmptyChat />
        )}
      </ScrollArea>
    </div>
  );
};
