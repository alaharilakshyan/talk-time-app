import React, { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    username: string;
    avatar: string;
  };
  text: string;
}

interface MessageNotificationProps {
  message: Message;
  onClose: () => void;
}

export const MessageNotification: React.FC<MessageNotificationProps> = ({
  message,
  onClose
}) => {
  useEffect(() => {
    toast({
      title: `New message from ${message.senderId.username}`,
      description: message.text,
      action: (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.senderId.avatar} alt={message.senderId.username} />
            <AvatarFallback>{message.senderId.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      ),
      onOpenChange: (open) => {
        if (!open) onClose();
      },
    });
  }, [message, onClose]);

  return null;
};
