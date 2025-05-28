import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  _id: string;
  username: string;
  avatar: string;
}

interface ChatHeaderProps {
  selectedUser: User;
  isOnline: boolean;
  isConnected: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedUser, isOnline, isConnected }) => {
  return (
    <div className="p-4 border-b flex items-center gap-3">
      <div className="relative">
        <Avatar>
          <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
          <AvatarFallback>{selectedUser.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold">{selectedUser.username}</h3>
        <Badge variant={isOnline ? "default" : "secondary"} className="text-xs font-normal">
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>
      
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <Wifi className="w-5 h-5 text-green-500" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-500" />
        )}
        <span className={cn(
          "text-sm",
          isConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};
