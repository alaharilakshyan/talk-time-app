import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserList } from './UserList';
import { Users, UserPlus } from 'lucide-react';
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
  onGroupSelect?: (groupId: string) => void;
}

export const FloatingUserSidebar: React.FC<FloatingUserSidebarProps> = ({
  users,
  selectedUserId,
  onUserSelect,
  onlineUsers,
  currentUserId,
  onRefresh,
  isRefreshing,
  onGroupSelect,
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
        className="fixed left-4 top-20 z-40 rounded-full h-14 w-14 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 border-0 hidden md:flex glow-primary"
        size="icon"
      >
        <Users className="h-6 w-6" />
      </Button>

      {/* Mobile bottom bar - WhatsApp style */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-2xl">
        <div className="grid grid-cols-2 gap-3 p-3">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 border-0 gap-2 text-base font-semibold shadow-lg shadow-violet-500/30"
          >
            <Users className="h-5 w-5" />
            <span>Chats</span>
          </Button>
          <Button
            className="h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 gap-2 text-base font-semibold shadow-lg shadow-cyan-500/30"
            onClick={() => {
              document.querySelector<HTMLButtonElement>('[data-add-friend-trigger]')?.click();
            }}
          >
            <UserPlus className="h-5 w-5" />
            <span>Add Friend</span>
          </Button>
        </div>
      </div>

      {/* Sidebar Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-full sm:w-80 p-0 bg-card/95 backdrop-blur-xl">
          <SheetHeader className="p-4 border-b border-border/50 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-lg font-bold">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Chats
              </SheetTitle>
              <CreateGroupDialog onGroupCreated={() => setGroupRefresh(prev => prev + 1)} />
            </div>
          </SheetHeader>
          
          <Tabs defaultValue="friends" className="flex-1">
            <TabsList className="w-full rounded-none border-b border-border/50 bg-transparent h-12 p-0">
              <TabsTrigger 
                value="friends" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary font-semibold"
              >
                Friends
              </TabsTrigger>
              <TabsTrigger 
                value="groups" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary font-semibold"
              >
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
                  onGroupSelect?.(groupId);
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
