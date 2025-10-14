import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users } from 'lucide-react';

interface User {
  id: string;
  username: string;
  user_tag: string;
  avatar_url: string | null;
  isOnline?: boolean;
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
      <div className="p-3 md:p-6 border-b border-border/50 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-base md:text-lg">Friends</h2>
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <ul className="divide-y divide-border/50">
          {users
            .filter(u => u.id !== currentUserId)
            .map((user) => {
              const isUserOnline = onlineUsers.has(user.id);
              const isSelected = selectedUserId === user.id;

              return (
                <li key={user.id}>
                  <button
                    onClick={() => onUserSelect(user.id)}
                    className={`w-full flex items-center gap-3 p-3 md:p-4 hover:bg-muted/50 transition-all duration-200 border-l-2 ${
                      isSelected 
                        ? 'border-primary bg-muted/50' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-background">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isUserOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-sm md:text-base truncate">
                        {user.username}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">
                        #{user.user_tag}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
        </ul>
      </ScrollArea>
    </div>
  );
};
