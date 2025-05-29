
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
  isLoading?: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentUserId,
  isLoading = false
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

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={cn("flex items-start gap-2 max-w-[80%]", i % 2 === 0 ? "ml-auto flex-row-reverse" : "mr-auto")}>
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId._id === currentUserId;
          const sender = isCurrentUser ? message.senderId : message.senderId;
          
          return (
            <div
              key={message._id}
              className={cn(
                "flex items-start gap-2 max-w-[80%]",
                isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage 
                  src={sender.avatar}
                  alt={sender.username}
                />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  {sender.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  "rounded-lg px-3 py-2 text-sm max-w-full",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {!isCurrentUser && (
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {sender.username}
                  </p>
                )}
                <p className="break-words">{message.text}</p>
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
