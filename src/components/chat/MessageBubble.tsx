import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    username: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  return (
    <div className={cn(
      "flex items-end gap-2 sm:gap-3 animate-fade-in",
      isCurrentUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="h-6 w-6 sm:h-8 sm:w-8 ring-2 ring-primary/20 shrink-0">
        <AvatarImage src={message.senderId.avatar} />
        <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
          {message.senderId.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col max-w-[75%] sm:max-w-[70%]",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        <span className="text-xs text-muted-foreground mb-1 px-2">
          {message.senderId.username}
        </span>
        
        <div className={cn(
          "rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg backdrop-blur-sm transition-all active:scale-95 sm:hover:scale-[1.02]",
          isCurrentUser 
            ? "bg-gradient-to-r from-primary to-secondary text-white rounded-br-sm" 
            : "bg-card/80 border border-primary/20 rounded-bl-sm"
        )}>
          <p className="text-sm break-words leading-relaxed">{message.text}</p>
        </div>
        
        <span className="text-xs text-muted-foreground mt-1 px-2">
          {format(new Date(message.createdAt), 'HH:mm')}
        </span>
      </div>
    </div>
  );
};
