import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserList } from './UserList';
import { Users } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface User {
  id: string;
  username: string;
  user_tag: string;
  avatar_url: string | null;
  bio: string | null;
  isOnline: boolean;
}

interface FloatingUserSidebarProps {
  users: User[];
  selectedUserId: string | null;
  onUserSelect: (userId: string) => void;
  onlineUsers: Set<string>;
  currentUserId: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const FloatingUserSidebar: React.FC<FloatingUserSidebarProps> = ({
  users,
  selectedUserId,
  onUserSelect,
  onlineUsers,
  currentUserId,
  onRefresh,
  isRefreshing,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Map users with online status
  const usersWithStatus = users.map(user => ({
    ...user,
    isOnline: onlineUsers.has(user.id)
  }));

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-20 z-50 rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all"
        size="icon"
      >
        <Users className="h-6 w-6" />
      </Button>

      {/* Sidebar Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Friends</SheetTitle>
          </SheetHeader>
          <UserList
            users={usersWithStatus}
            selectedUserId={selectedUserId}
            onUserSelect={(userId) => {
              onUserSelect(userId);
              setIsOpen(false);
            }}
            onlineUsers={onlineUsers}
            currentUserId={currentUserId}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};
