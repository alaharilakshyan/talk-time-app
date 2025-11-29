import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserList } from './UserList';
import { Users, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CreateGroupDialog } from './CreateGroupDialog';
import { GroupList } from './GroupList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [groupRefresh, setGroupRefresh] = useState(0);

  const usersWithStatus = users.map(user => ({
    ...user,
    isOnline: onlineUsers.has(user.id)
  }));

  return (
    <>
      {/* Floating Button - Hidden on mobile */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-20 z-40 rounded-2xl h-12 w-12 sm:h-14 sm:w-14 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 hidden md:flex"
        size="icon"
      >
        <Users className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      {/* Mobile bottom bar - WhatsApp style */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 bg-background/95 backdrop-blur-xl border-t shadow-lg">
        <div className="grid grid-cols-2 gap-2 p-3">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 gap-2 text-base font-medium"
          >
            <Users className="h-5 w-5" />
            <span>Chats</span>
          </Button>
          <Button
            variant="outline"
            className="h-14 rounded-xl gap-2 text-base font-medium"
            onClick={() => {
              // This will be handled by the add friend dialog in ChatInterface
              document.querySelector<HTMLButtonElement>('[data-add-friend-trigger]')?.click();
            }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Add Friend</span>
          </Button>
        </div>
      </div>

      {/* Sidebar Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-full sm:w-80 p-0">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Chats
              </SheetTitle>
              <CreateGroupDialog onGroupCreated={() => setGroupRefresh(prev => prev + 1)} />
            </div>
          </SheetHeader>
          
          <Tabs defaultValue="friends" className="flex-1">
            <TabsList className="w-full rounded-none border-b bg-transparent h-12">
              <TabsTrigger value="friends" className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Friends
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Groups
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="friends" className="m-0 h-[calc(100vh-180px)]">
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
            </TabsContent>
            
            <TabsContent value="groups" className="m-0 h-[calc(100vh-180px)]">
              <GroupList
                selectedGroupId={null}
                onGroupSelect={(groupId) => {
                  // TODO: Handle group selection
                  setIsOpen(false);
                }}
                refreshTrigger={groupRefresh}
              />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
};
