
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  isOnline: boolean;
  avatar?: string;
  unreadCount?: number;
}

interface FloatingUserSidebarProps {
  users: User[];
  selectedUserId: string | null;
  onUserSelect: (userId: string) => void;
  isConnected: boolean;
}

export const FloatingUserSidebar: React.FC<FloatingUserSidebarProps> = ({
  users,
  selectedUserId,
  onUserSelect,
  isConnected
}) => {
  return (
    <Card className="fixed left-4 top-1/2 transform -translate-y-1/2 w-16 bg-white dark:bg-gray-900 border-orange-200 dark:border-orange-800 shadow-lg z-50">
      <div className="p-2 space-y-2">
        {/* Connection status indicator */}
        <div className="flex justify-center">
          <div className={cn(
            "w-3 h-3 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
        </div>
        
        {/* User avatars */}
        {users.map((user) => (
          <div key={user.id} className="relative">
            <button
              onClick={() => onUserSelect(user.id)}
              className={cn(
                "relative w-12 h-12 rounded-full transition-transform hover:scale-105",
                selectedUserId === user.id && "ring-2 ring-orange-500"
              )}
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-orange-400 to-rose-400 text-white">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Online indicator */}
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              )}
              
              {/* Unread count badge */}
              {user.unreadCount && user.unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                >
                  {user.unreadCount > 9 ? '9+' : user.unreadCount}
                </Badge>
              )}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};
