
import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  avatar: string;
  lastSeen: string | null;
}

interface UserListProps {
  users: User[];
  selectedUserId: string | null;
  onUserSelect: (userId: string) => void;
  onlineUsers: Set<string>;
  currentUserId: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  selectedUserId,
  onUserSelect,
  onlineUsers,
  currentUserId,
  onRefresh,
  isRefreshing = false
}) => {
  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never';
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Contacts</h2>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {users.map((user) => {
            const isOnline = onlineUsers.has(user._id);
            const isCurrentUser = user._id === currentUserId;
            
            return (
              <button
                key={user._id}
                onClick={() => !isCurrentUser && onUserSelect(user._id)}
                disabled={isCurrentUser}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                  !isCurrentUser && "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  selectedUserId === user._id && "bg-accent text-accent-foreground",
                  isCurrentUser && "opacity-60 cursor-not-allowed",
                  "relative"
                )}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.username}</span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        me
                      </Badge>
                    )}
                  </div>
                  {!isOnline && !isCurrentUser && (
                    <p className="text-xs text-muted-foreground">
                      Last seen: {formatLastSeen(user.lastSeen)}
                    </p>
                  )}
                  {isOnline && !isCurrentUser && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Online
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
