
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
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
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  selectedUser, 
  isOnline, 
  isConnected,
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <div className="p-6 border-b border-white/10 flex items-center gap-4 backdrop-blur-sm">
      <div className="relative">
        <Avatar className="h-12 w-12 ring-2 ring-white/20">
          <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
            {selectedUser.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-background shadow-lg" />
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{selectedUser.username}</h3>
        <Badge 
          variant={isOnline ? "default" : "secondary"} 
          className={cn(
            "text-xs font-normal backdrop-blur-sm",
            isOnline 
              ? "bg-green-500/20 text-green-400 border-green-500/30" 
              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
          )}
        >
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>
      
      <div className="flex items-center space-x-3">
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hover:bg-white/10 backdrop-blur-sm"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        )}
        
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-green-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          <span className={cn(
            "text-sm font-medium",
            isConnected ? "text-green-400" : "text-red-400"
          )}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};
