
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  isOnline: boolean;
  avatar?: string;
  unreadCount?: number;
}

interface ChatHeaderProps {
  selectedUser: User | undefined;
  isConnected: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedUser, isConnected }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900">
      {selectedUser ? (
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedUser.avatar} />
              <AvatarFallback className="bg-gradient-to-r from-orange-400 to-rose-400 text-white">
                {selectedUser.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {selectedUser.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {selectedUser.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      ) : (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Select a user to start chatting
        </h3>
      )}
      
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
