
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className={cn(
      "flex",
      message.isOwn ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex items-end space-x-2 max-w-xs md:max-w-md",
        message.isOwn ? "flex-row-reverse space-x-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-xs">
            {message.senderName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Message Card */}
        <Card className={cn(
          "p-3 max-w-full",
          message.isOwn 
            ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white border-none" 
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        )}>
          <div className="space-y-1">
            {!message.isOwn && (
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                {message.senderName}
              </p>
            )}
            <p className={cn(
              "text-sm leading-relaxed break-words",
              message.isOwn 
                ? "text-white" 
                : "text-gray-900 dark:text-gray-100"
            )}>
              {message.text}
            </p>
            <p className={cn(
              "text-xs",
              message.isOwn 
                ? "text-orange-100" 
                : "text-gray-500 dark:text-gray-400"
            )}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
