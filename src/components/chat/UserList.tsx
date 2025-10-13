
import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, User as UserIcon } from 'lucide-react';

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
      <div className="p-6 border-b border-white/10 flex items-center justify-between backdrop-blur-sm">
        <h2 className="font-semibold text-lg">Contacts</h2>
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
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {users.map((user) => {
            const isOnline = onlineUsers.has(user._id);
            const isCurrentUser = user._id === currentUserId;
            
            return (
              <button
                key={user._id}
                onClick={() => !isCurrentUser && onUserSelect(user._id)}
                disabled={isCurrentUser}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 backdrop-blur-sm border",
                  !isCurrentUser && "hover:bg-white/10 hover:border-white/30 cursor-pointer transform hover:scale-[1.02]",
                  selectedUserId === user._id && "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30",
                  isCurrentUser && "opacity-60 cursor-not-allowed bg-white/5 border-white/10",
                  "relative overflow-hidden group"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-white/20">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && !isCurrentUser && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-background shadow-lg" />
                  )}
                  {isCurrentUser && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-background shadow-lg flex items-center justify-center">
                      <UserIcon className="w-2 h-2 text-white" />
                    </span>
                  )}
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{user.username}</span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                        me
                      </Badge>
                    )}
                  </div>
                  {!isOnline && !isCurrentUser && (
                    <p className="text-xs text-muted-foreground/70">
                      Last seen: {formatLastSeen(user.lastSeen)}
                    </p>
                  )}
                  {isOnline && !isCurrentUser && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      Online
                    </p>
                  )}
                  {isCurrentUser && (
                    <p className="text-xs text-blue-400">
                      Your account
                    </p>
                  )}
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
