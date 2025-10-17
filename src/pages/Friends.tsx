import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FriendRequests } from '@/components/friends/FriendRequests';
import { UserSearch } from '@/components/friends/UserSearch';

const Friends = () => {
  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Friends</h1>
        
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Add Friends</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="mt-6">
            <UserSearch />
          </TabsContent>
          
          <TabsContent value="requests" className="mt-6">
            <FriendRequests />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Friends;
