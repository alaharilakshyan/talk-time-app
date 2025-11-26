import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLiveNotifications } from '@/hooks/useLiveNotifications';
import { encryptMessage } from '@/utils/encryption';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { FloatingUserSidebar } from './FloatingUserSidebar';
import { EmptyChat } from './EmptyChat';
import { Badge } from '@/components/ui/badge';
import { UserProfileDialog } from './UserProfileDialog';
import { UserPlus } from 'lucide-react';
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
  bio: string | null;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [addFriendDialog, setAddFriendDialog] = useState(false);
  const [friendUserTag, setFriendUserTag] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [chatBackground, setChatBackground] = useState<string | null>(null);

  const selectedFriend = friends.find(f => f.id === selectedFriendId);

  // Live notifications for new messages
  useLiveNotifications({
    userId: user?.id || '',
    currentChatUserId: selectedFriendId,
    onNewMessage: (newMessage) => {
      // Refresh friends list to update unread counts
      fetchFriends();
    },
  });

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
          avatar_url,
          bio
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
          avatar_url,
          bio
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
    // Load chat background from localStorage
    const loadBackground = () => {
      const savedBackground = localStorage.getItem('chatBackground');
      setChatBackground(savedBackground);
    };
    
    loadBackground();
    
    // Listen for storage changes
    window.addEventListener('storage', loadBackground);
    return () => window.removeEventListener('storage', loadBackground);
  }, []);

  useEffect(() => {
    if (user) {
      fetchFriends();

      // Subscribe to presence for online status
      const presenceChannel = supabase.channel('online-users');
      
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const online = new Set(
            Object.keys(state)
              .flatMap(k => state[k])
              .map((presence: any) => presence.user_id)
              .filter(Boolean)
          );
          setOnlineUsers(online);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          const userId = (newPresences[0] as any)?.user_id;
          if (userId) {
            setOnlineUsers(prev => new Set([...prev, userId]));
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          const userId = (leftPresences[0] as any)?.user_id;
          if (userId) {
            setOnlineUsers(prev => {
              const next = new Set(prev);
              next.delete(userId);
              return next;
            });
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannel.track({ user_id: user.id, online_at: new Date().toISOString() });
          }
        });

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
        supabase.removeChannel(presenceChannel);
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
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
          },
          (payload: any) => {
            // Update message if it's deleted or modified
            if (payload.new.sender_id === selectedFriendId || payload.new.receiver_id === selectedFriendId) {
              setMessages(prev => prev.map(msg => msg.id === payload.new.id ? payload.new : msg));
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
  };

  const handleSendMessage = async () => {
    if (!user || !selectedFriendId || (!newMessage.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    setUploading(true);

    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let messageContent = newMessage.trim();

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
      
      // Check if it's a voice message
      if (selectedFile.type.startsWith('audio/') && !messageContent) {
        messageContent = '[Voice message]';
      } else if (!messageContent) {
        messageContent = 'Sent a file';
      }
    }

    // Encrypt message content with conversation key (both users can decrypt)
    const encryptedContent = await encryptMessage(messageContent, user.id, selectedFriendId);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: selectedFriendId,
        content: encryptedContent,
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

  const handleVoiceRecording = (file: File) => {
    setSelectedFile(file);
    // Auto-send voice message
    setTimeout(() => handleSendMessage(), 100);
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

  // Map friends with online status
  const friendsWithStatus = friends.map(friend => ({
    ...friend,
    isOnline: onlineUsers.has(friend.id)
  }));

  return (
    <div className="h-[calc(100vh-4rem)] flex max-w-7xl mx-auto p-2 md:p-6 relative">
      {/* Floating Friends Sidebar */}
      <FloatingUserSidebar
        users={friendsWithStatus}
        selectedUserId={selectedFriendId}
        onUserSelect={handleFriendSelect}
        onlineUsers={onlineUsers}
        currentUserId={user.id}
        onRefresh={fetchFriends}
        isRefreshing={false}
      />

      {/* Add Friend Dialog */}
      <Dialog open={addFriendDialog} onOpenChange={setAddFriendDialog}>
        <DialogTrigger asChild>
          <Button 
            className="fixed left-4 top-36 z-50 rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all"
            size="icon"
          >
            <UserPlus className="h-6 w-6" />
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

      {/* Chat Area */}
      <div 
        className="flex-1 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden flex flex-col shadow-xl relative"
        style={chatBackground ? {
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${chatBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        } : undefined}
      >
        {selectedFriend ? (
          <>
            <ChatHeader
              selectedUser={selectedFriend}
              isOnline={onlineUsers.has(selectedFriendId!)}
              isTyping={typingUsers.has(selectedFriendId!)}
              isConnected={true}
              onRefresh={() => fetchMessages(selectedFriendId!)}
              isRefreshing={isLoading}
              onUserClick={() => setProfileDialogOpen(true)}
            />
            <ChatMessages
              messages={messages}
              currentUserId={user.id}
              otherUserId={selectedFriendId!}
              isLoading={isLoading}
              onDelete={(messageId) => setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_deleted: true } : m))}
            />
            <ChatInput
              value={newMessage}
              onChange={setNewMessage}
              onSend={handleSendMessage}
              isDisabled={isSending || uploading}
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              onClearFile={() => setSelectedFile(null)}
              onVoiceRecordingComplete={handleVoiceRecording}
            />
          </>
        ) : (
          <EmptyChat />
        )}
      </div>

      {/* User Profile Dialog */}
      {selectedFriendId && (
        <UserProfileDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          userId={selectedFriendId}
          currentUserId={user.id}
        />
      )}
    </div>
  );
};
