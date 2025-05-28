
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  isOnline: boolean;
  avatar?: string;
}

interface UserListProps {
  users: User[];
  selectedUserId: string | null;
  onUserSelect: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ 
  users, 
  selectedUserId, 
  onUserSelect 
}) => {
  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {users.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p className="text-sm">No other users online</p>
          </div>
        ) : (
          <div className="space-y-1">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user.id)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/20",
                  selectedUserId === user.id 
                    ? "bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Online indicator */}
                    <div 
                      className={cn(
                        "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900",
                        user.isOnline ? "bg-green-500" : "bg-gray-400"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user.username}
                    </p>
                    <p className={cn(
                      "text-xs",
                      user.isOnline 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-gray-500 dark:text-gray-400"
                    )}>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
