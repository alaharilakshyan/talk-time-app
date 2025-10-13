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
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 sm:p-6 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Messages
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hover:bg-primary/10 transition-all h-8 w-8 sm:h-10 sm:w-10"
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 sm:p-4 space-y-1 sm:space-y-2">
          {users.map((user) => {
            const isOnline = onlineUsers.has(user._id);
            const isCurrentUser = user._id === currentUserId;
            
            return (
              <button
                key={user._id}
                onClick={() => onUserSelect(user._id)}
                className={cn(
                  "w-full p-3 sm:p-4 rounded-xl transition-all duration-200",
                  "hover:bg-primary/10 active:scale-95 sm:hover:scale-[1.02] hover:shadow-lg",
                  "flex items-center gap-2 sm:gap-3",
                  selectedUserId === user._id && "bg-gradient-to-r from-primary/20 to-secondary/20 shadow-lg"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-sm sm:text-base">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                  )}
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <p className="font-medium truncate text-sm sm:text-base">
                      {user.username}
                    </p>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs px-1.5 sm:px-2 py-0 backdrop-blur-sm">
                        (me)
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
