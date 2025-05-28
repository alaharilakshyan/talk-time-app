import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentUserId,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId._id === currentUserId;
          
          return (
            <div
              key={message._id}
              className={cn(
                "flex items-start gap-2 max-w-[80%]",
                isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={isCurrentUser ? message.senderId.avatar : message.receiverId.avatar}
                  alt={isCurrentUser ? message.senderId.username : message.receiverId.username}
                />
                <AvatarFallback>
                  {isCurrentUser 
                    ? message.senderId.username[0].toUpperCase()
                    : message.receiverId.username[0].toUpperCase()
                  }
                </AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p>{message.text}</p>
                <span className={cn(
                  "text-[10px] select-none mt-1 block",
                  isCurrentUser
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                )}>
                  {formatTime(message.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
