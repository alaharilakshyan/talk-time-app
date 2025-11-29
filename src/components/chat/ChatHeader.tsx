import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search, X } from 'lucide-react';

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
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  selectedUser, 
  isOnline,
  isTyping,
  isConnected,
  onRefresh,
  isRefreshing = false,
  onUserClick,
  searchQuery = '',
  onSearchChange
}) => {
  const [showSearch, setShowSearch] = React.useState(false);

  return (
    <div className="border-b border-border/50 backdrop-blur-sm">
      <div className="p-3 md:p-6 flex items-center gap-3 md:gap-4">
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
        
        {onSearchChange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="flex-shrink-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
        
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
      
      {showSearch && onSearchChange && (
        <div className="px-3 md:px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search messages..."
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
