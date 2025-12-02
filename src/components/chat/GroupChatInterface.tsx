import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  Loader2, 
  Users, 
  ArrowLeft,
  Image as ImageIcon,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GroupMessage {
  id: string;
  sender_id: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  is_deleted: boolean;
  created_at: string;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
}

interface GroupInfo {
  id: string;
  name: string;
  avatar_url: string | null;
  created_by: string;
  members: Array<{
    user_id: string;
    username: string;
    avatar_url: string | null;
    role: string;
  }>;
}

interface GroupChatInterfaceProps {
  groupId: string;
  onBack?: () => void;
}

export const GroupChatInterface: React.FC<GroupChatInterfaceProps> = ({
  groupId,
  onBack,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (groupId) {
      fetchGroupInfo();
      fetchMessages();
      
      const channel = supabase
        .channel(`group-messages-${groupId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `group_id=eq.${groupId}`,
          },
          async (payload) => {
            const { data: senderData } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', payload.new.sender_id)
              .single();
            
            setMessages((prev) => [...prev, { ...payload.new, sender: senderData } as GroupMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [groupId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchGroupInfo = async () => {
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError) {
      console.error('Error fetching group:', groupError);
      return;
    }

    const { data: membersData } = await supabase
      .from('group_members')
      .select(`
        user_id,
        role,
        profiles:user_id(username, avatar_url)
      `)
      .eq('group_id', groupId);

    setGroup({
      ...groupData,
      members: membersData?.map((m: any) => ({
        user_id: m.user_id,
        username: m.profiles?.username,
        avatar_url: m.profiles?.avatar_url,
        role: m.role,
      })) || [],
    });
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(username, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!user || (!newMessage.trim() && !selectedFile) || isSending) return;
    setIsSending(true);

    let fileUrl = null;
    let fileName = null;

    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `groups/${groupId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, selectedFile);

      if (uploadError) {
        toast({
          title: 'Error',
          description: 'Failed to upload file',
          variant: 'destructive',
        });
        setIsSending(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      fileUrl = urlData.publicUrl;
      fileName = selectedFile.name;
    }

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: user.id, // Self-reference for group messages
      group_id: groupId,
      content: newMessage.trim() || (selectedFile ? 'Sent a file' : ''),
      file_url: fileUrl,
      file_name: fileName,
    });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } else {
      setNewMessage('');
      setSelectedFile(null);
    }

    setIsSending(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true, content: 'This message was deleted' })
      .eq('id', messageId)
      .eq('sender_id', user?.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, is_deleted: true, content: 'This message was deleted' } : m
        )
      );
    }
  };

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={group.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Users className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold">{group.name}</h2>
          <p className="text-xs text-muted-foreground">
            {group.members.length} members
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isSent = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.sender?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {message.sender?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isSent
                        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {!isSent && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {message.sender?.username}
                      </p>
                    )}
                    {message.is_deleted ? (
                      <p className="italic opacity-60">{message.content}</p>
                    ) : (
                      <>
                        {message.file_url && (
                          <img
                            src={message.file_url}
                            alt={message.file_name || 'Image'}
                            className="rounded-lg max-w-full mb-2"
                          />
                        )}
                        <p className="break-words">{message.content}</p>
                      </>
                    )}
                    <p className={`text-[10px] mt-1 ${isSent ? 'text-white/60' : 'text-muted-foreground'}`}>
                      {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                  </div>
                  {isSent && !message.is_deleted && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-xl">
        {selectedFile && (
          <div className="mb-2 p-2 bg-muted rounded-lg flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="text-sm truncate flex-1">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              Remove
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            className="flex-1 bg-muted/50"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || (!newMessage.trim() && !selectedFile)}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
