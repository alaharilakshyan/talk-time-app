
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
      <div className="flex-1 p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={cn(
            "flex items-start gap-3 max-w-[80%] animate-pulse",
            i % 2 === 0 ? "ml-auto flex-row-reverse" : "mr-auto"
          )}>
            <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px] bg-white/20" />
              <Skeleton className="h-4 w-[150px] bg-white/20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-6">
      <div className="space-y-6">
        {messages.map((message) => {
          const isCurrentUser = message.senderId._id === currentUserId;
          const sender = message.senderId;
          
          return (
            <div
              key={message._id}
              className={cn(
                "flex items-start gap-3 max-w-[75%] animate-fade-in",
                isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-white/20">
                <AvatarImage 
                  src={sender.avatar}
                  alt={sender.username}
                />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                  {sender.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm max-w-full backdrop-blur-sm border",
                  isCurrentUser
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-white/20 shadow-lg"
                    : "bg-white/10 text-foreground border-white/20 shadow-lg"
                )}
              >
                {!isCurrentUser && (
                  <p className="text-xs font-medium mb-2 opacity-70">
                    {sender.username}
                  </p>
                )}
                <p className="break-words leading-relaxed">{message.text}</p>
                <span className={cn(
                  "text-[10px] select-none mt-2 block opacity-70",
                  isCurrentUser
                    ? "text-white/80"
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
