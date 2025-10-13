import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  avatar: string;
}

interface ChatHeaderProps {
  selectedUser: User;
  isOnline: boolean;
  isConnected: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  selectedUser, 
  isOnline, 
  isConnected,
  onRefresh,
  isRefreshing = false,
  onBack
}) => {
  return (
    <div className="p-3 sm:p-6 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {/* Back button for mobile */}
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="md:hidden hover:bg-primary/10 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/20">
              <AvatarImage src={selectedUser.avatar} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-sm sm:text-base">
                {selectedUser.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
              {selectedUser.username}
            </h2>
            <Badge variant={isOnline ? "default" : "secondary"} className="mt-0.5 sm:mt-1 text-xs backdrop-blur-sm">
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={!isConnected || isRefreshing}
          className="hover:bg-primary/10 transition-all shrink-0"
        >
          <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};
