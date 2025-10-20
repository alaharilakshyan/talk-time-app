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
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [addFriendDialog, setAddFriendDialog] = useState(false);
  const [friendUserTag, setFriendUserTag] = useState('');

  const selectedFriend = friends.find(f => f.id === selectedFriendId);

  // Fetch friends
  const fetchFriends = async () => {
    if (!user) return;

    // Fetch friends where I'm the user OR where I'm the friend (bidirectional)
    const { data: sentFriends, error: sentError } = await supabase
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

    const { data: receivedFriends, error: receivedError } = await supabase
      .from('friends')
      .select(`
        user_id,
        profiles:user_id (
          id,
          username,
          user_tag,
          avatar_url
        )
      `)
      .eq('friend_id', user.id)
      .eq('status', 'accepted');

    if (sentError || receivedError) {
      console.error('Error fetching friends:', sentError || receivedError);
      return;
    }

    const allFriendProfiles = [
      ...(sentFriends?.map((f: any) => f.profiles).filter(Boolean) || []),
      ...(receivedFriends?.map((f: any) => f.profiles).filter(Boolean) || [])
    ];

    setFriends(allFriendProfiles);
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

      // Subscribe to friend updates
      const channel = supabase
        .channel('friends-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friends',
            filter: `user_id=eq.${user.id},friend_id=eq.${user.id}`,
          },
          (payload: any) => {
            if (payload.eventType === 'UPDATE' && payload.new.status === 'accepted') {
              toast({
                title: "New Friend! 🎉",
                description: "Someone accepted your friend request!",
              });
            }
            fetchFriends();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
    if (!user || !selectedFriendId || (!newMessage.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    setUploading(true);

    let fileUrl = null;
    let fileName = null;
    let fileSize = null;

    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, selectedFile);

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload file",
          variant: "destructive",
        });
        setIsSending(false);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      fileUrl = urlData.publicUrl;
      fileName = selectedFile.name;
      fileSize = selectedFile.size;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: selectedFriendId,
        content: newMessage.trim() || 'Sent a file',
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
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
      setSelectedFile(null);
    }

    setIsSending(false);
    setUploading(false);
  };

  const handleBackToList = () => {
    setShowUserList(true);
    setSelectedFriendId(null);
  };

  const handleAddFriend = async () => {
    if (!user || !friendUserTag.trim()) return;

    try {
      // Find user by tag
      const { data: friendProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('user_tag', friendUserTag.trim())
        .single();

      if (profileError || !friendProfile) {
        toast({
          title: "Error",
          description: "User not found with that tag",
          variant: "destructive",
        });
        return;
      }

      if (friendProfile.id === user.id) {
        toast({
          title: "Error",
          description: "You cannot add yourself as a friend",
          variant: "destructive",
        });
        return;
      }

      // Check if already friends
      const { data: existingFriend } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendProfile.id}),and(user_id.eq.${friendProfile.id},friend_id.eq.${user.id})`)
        .single();

      if (existingFriend) {
        toast({
          title: "Info",
          description: existingFriend.status === 'pending' ? "Friend request already sent" : "Already friends",
        });
        return;
      }

      // Send friend request
      const { error: insertError } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendProfile.id,
          status: 'accepted' // Auto-accept for simplicity
        });

      if (insertError) {
        toast({
          title: "Error",
          description: "Failed to add friend",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success! 🎉",
        description: `${friendProfile.username} added as friend`,
      });

      setAddFriendDialog(false);
      setFriendUserTag('');
      fetchFriends();
    } catch (error) {
      console.error('Add friend error:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
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
        
        <div className="p-4 border-t border-border/50 space-y-2">
          <Dialog open={addFriendDialog} onOpenChange={setAddFriendDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <UserPlus className="h-4 w-4" />
                Add Friend
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Friend</DialogTitle>
                <DialogDescription>
                  Enter your friend's user tag (the 4-digit number) to add them.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="userTag">User Tag</Label>
                  <Input
                    id="userTag"
                    placeholder="1234"
                    value={friendUserTag}
                    onChange={(e) => setFriendUserTag(e.target.value)}
                    maxLength={4}
                  />
                </div>
                <Button onClick={handleAddFriend} className="w-full">
                  Add Friend
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
              isDisabled={isSending || uploading}
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              onClearFile={() => setSelectedFile(null)}
            />
          </>
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
};
