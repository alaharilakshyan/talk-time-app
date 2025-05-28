
import React, { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

interface MessageNotificationProps {
  message: Message;
  currentUserId: string;
}

export const MessageNotification: React.FC<MessageNotificationProps> = ({ message, currentUserId }) => {
  useEffect(() => {
    if (message.senderId._id !== currentUserId) {
      toast({
        title: `New message from ${message.senderId.username}`,
        description: message.text,
        action: (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.senderId.avatar} />
            <AvatarFallback>
              {message.senderId.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ),
      });
    }
  }, [message, currentUserId]);

  return null;
};
