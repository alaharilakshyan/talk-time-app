import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { UserList } from './UserList';
import { EmptyChat } from './EmptyChat';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  is_deleted: boolean;
  created_at: string;
  sender: {
    username: string;
    avatar_url: string | null;
  };
}

interface Profile {
  id: string;
  username: string;
  user_tag: string;
  avatar_url: string | null;
  isOnline?: boolean;
}

export const ChatInterface = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [friends, setFriends] = useState<Profile[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserList, setShowUserList] = useState(true);

  const selectedFriend = friends.find(f => f.id === selectedFriendId);

  // Fetch friends
  const fetchFriends = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('friends')
      .select(`
        friend_id,
        profiles:friend_id (
          id,
          username,
          user_tag,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching friends:', error);
      return;
    }

    const friendProfiles = data?.map((f: any) => f.profiles).filter(Boolean) || [];
    setFriends(friendProfiles);
  };

  // Fetch messages
  const fetchMessages = async (friendId: string) => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id (username, avatar_url)
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } else {
      setMessages(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  useEffect(() => {
    if (selectedFriendId) {
      fetchMessages(selectedFriendId);
      
      // Subscribe to new messages
      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user?.id}`,
          },
          (payload: any) => {
            if (payload.new.sender_id === selectedFriendId || payload.new.receiver_id === selectedFriendId) {
              setMessages(prev => [...prev, payload.new]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedFriendId, user]);

  const handleFriendSelect = (friendId: string) => {
    setSelectedFriendId(friendId);
    setShowUserList(false);
  };

  const handleSendMessage = async () => {
    if (!user || !selectedFriendId || !newMessage.trim() || isSending) return;

    setIsSending(true);
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: selectedFriendId,
        content: newMessage.trim(),
      })
      .select(`
        *,
        sender:profiles!sender_id (username, avatar_url)
      `)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } else {
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    }

    setIsSending(false);
  };

  const handleBackToList = () => {
    setShowUserList(true);
    setSelectedFriendId(null);
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4 md:gap-6 max-w-7xl mx-auto p-2 md:p-6">
      {/* User List - Mobile: Full screen when visible, Desktop: Always visible */}
      <div className={`${showUserList ? 'flex' : 'hidden'} md:flex w-full md:w-80 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden flex-col shadow-xl`}>
        <UserList
          users={friends}
          selectedUserId={selectedFriendId}
          onUserSelect={handleFriendSelect}
          onlineUsers={new Set()}
          currentUserId={user.id}
          onRefresh={fetchFriends}
          isRefreshing={false}
        />
        
        <div className="p-4 border-t border-border/50">
          <Badge variant="default" className="w-full justify-center">
            Connected
          </Badge>
        </div>
      </div>

      {/* Chat Area - Mobile: Full screen when friend selected, Desktop: Always visible */}
      <div className={`${!showUserList ? 'flex' : 'hidden'} md:flex flex-1 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden flex-col shadow-xl`}>
        {selectedFriend ? (
          <>
            {/* Mobile back button */}
            <div className="md:hidden p-2 border-b border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            
            <ChatHeader
              selectedUser={selectedFriend}
              isOnline={false}
              isConnected={true}
              onRefresh={() => fetchMessages(selectedFriendId!)}
              isRefreshing={isLoading}
            />
            <ChatMessages
              messages={messages}
              currentUserId={user.id}
              isLoading={isLoading}
            />
            <ChatInput
              value={newMessage}
              onChange={setNewMessage}
              onSend={handleSendMessage}
              isDisabled={isSending}
            />
          </>
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
};
