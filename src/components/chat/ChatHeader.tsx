import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface User {
  id: string;
  username: string;
  user_tag: string;
  avatar_url: string | null;
  bio: string | null;
  isOnline?: boolean;
}

interface ChatHeaderProps {
  selectedUser: User;
  isOnline: boolean;
  isTyping: boolean;
  isConnected: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onUserClick?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  selectedUser, 
  isOnline,
  isTyping,
  isConnected,
  onRefresh,
  isRefreshing = false,
  onUserClick
}) => {
  return (
    <div className="p-3 md:p-6 border-b border-border/50 flex items-center gap-3 md:gap-4 backdrop-blur-sm">
      <div 
        className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onUserClick}
      >
        <div className="relative">
          <Avatar className="h-9 w-9 md:h-10 md:w-10 ring-2 ring-background">
            <AvatarImage src={selectedUser.avatar_url || undefined} alt={selectedUser.username} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              {selectedUser.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm md:text-lg truncate">
            {selectedUser.username}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground truncate">
            {isTyping ? (
              <span className="text-primary animate-pulse">typing...</span>
            ) : isOnline ? (
              <span className="text-green-500">online</span>
            ) : (
              'offline'
            )}
          </p>
        </div>
      </div>
      
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
};
