import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  is_deleted: boolean;
  created_at: string;
  isSent?: boolean;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
}

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSent }) => {
  const senderName = isSent ? 'You' : (message.sender?.username || 'Unknown');
  const avatarUrl = message.sender?.avatar_url;

  if (message.is_deleted) {
    return (
      <div className={`flex gap-2 md:gap-3 mb-3 md:mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}>
        <div className="italic text-muted-foreground text-sm">Message deleted</div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 md:gap-3 mb-3 md:mb-4 animate-fade-in ${isSent ? 'justify-end' : 'justify-start'}`}>
      {!isSent && (
        <Avatar className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0">
          <AvatarImage src={avatarUrl || undefined} alt={senderName} />
          <AvatarFallback className="text-xs">{senderName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[75%] md:max-w-[70%] ${isSent ? 'items-end' : 'items-start'}`}>
        {!isSent && (
          <span className="text-xs md:text-sm font-medium mb-1 px-1">
            {senderName}
          </span>
        )}
        
        <div className={`rounded-2xl px-3 py-2 md:px-4 md:py-2.5 shadow-sm ${
          isSent 
            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
            : 'bg-card border border-border/50 rounded-tl-sm'
        }`}>
          <p className="text-sm md:text-base break-words whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
          <span className={`text-xs mt-1.5 block ${
            isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            {new Date(message.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
      
      {isSent && (
        <Avatar className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0">
          <AvatarImage src={avatarUrl || undefined} alt={senderName} />
          <AvatarFallback className="text-xs">{senderName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
