import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
}

export const UserList: React.FC<UserListProps> = ({
  users,
  selectedUserId,
  onUserSelect,
  onlineUsers
}) => {
  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never';
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    // More than a day
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-2">
        {users.map((user) => {
          const isOnline = onlineUsers.has(user._id);
          
          return (
            <button
              key={user._id}
              onClick={() => onUserSelect(user._id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                selectedUserId === user._id && "bg-accent text-accent-foreground",
                "relative"
              )}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
              
              <div className="flex-1 text-left">
                <div className="font-medium">{user.username}</div>
                {!isOnline && (
                  <p className="text-xs text-muted-foreground">
                    Last seen: {formatLastSeen(user.lastSeen)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
