import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Send, Search, Loader2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { encryptMessage } from '@/utils/encryption';

interface ForwardTarget {
  id: string;
  name: string;
  avatar_url: string | null;
  type: 'user' | 'group';
}

interface ForwardMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: {
    id: string;
    content: string;
    file_url: string | null;
    file_name: string | null;
  } | null;
}

export const ForwardMessageDialog: React.FC<ForwardMessageDialogProps> = ({
  open,
  onOpenChange,
  message,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [targets, setTargets] = useState<ForwardTarget[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [forwarding, setForwarding] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTargets();
      setSelectedTargets([]);
      setSearchQuery('');
    }
  }, [open]);

  const fetchTargets = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch friends
    const { data: sentFriends } = await supabase
      .from('friends')
      .select('profiles:friend_id(id, username, avatar_url)')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    const { data: receivedFriends } = await supabase
      .from('friends')
      .select('profiles:user_id(id, username, avatar_url)')
      .eq('friend_id', user.id)
      .eq('status', 'accepted');

    // Fetch groups
    const { data: groups } = await supabase
      .from('group_members')
      .select('group:groups(id, name, avatar_url)')
      .eq('user_id', user.id);

    const friendTargets: ForwardTarget[] = [
      ...(sentFriends?.map((f: any) => ({
        id: f.profiles?.id,
        name: f.profiles?.username,
        avatar_url: f.profiles?.avatar_url,
        type: 'user' as const,
      })).filter((t: any) => t.id) || []),
      ...(receivedFriends?.map((f: any) => ({
        id: f.profiles?.id,
        name: f.profiles?.username,
        avatar_url: f.profiles?.avatar_url,
        type: 'user' as const,
      })).filter((t: any) => t.id) || []),
    ];

    const groupTargets: ForwardTarget[] = groups?.map((g: any) => ({
      id: g.group?.id,
      name: g.group?.name,
      avatar_url: g.group?.avatar_url,
      type: 'group' as const,
    })).filter((t: any) => t.id) || [];

    setTargets([...friendTargets, ...groupTargets]);
    setLoading(false);
  };

  const toggleTarget = (targetId: string) => {
    setSelectedTargets((prev) =>
      prev.includes(targetId)
        ? prev.filter((id) => id !== targetId)
        : [...prev, targetId]
    );
  };

  const handleForward = async () => {
    if (!user || !message || selectedTargets.length === 0) return;
    setForwarding(true);

    try {
      for (const targetId of selectedTargets) {
        const target = targets.find((t) => t.id === targetId);
        if (!target) continue;

        const forwardedContent = `↪️ Forwarded: ${message.content}`;
        const encryptedContent = target.type === 'user' 
          ? await encryptMessage(forwardedContent, user.id, targetId)
          : forwardedContent;

        await supabase.from('messages').insert({
          sender_id: user.id,
          receiver_id: target.type === 'user' ? targetId : user.id,
          group_id: target.type === 'group' ? targetId : null,
          content: encryptedContent,
          file_url: message.file_url,
          file_name: message.file_name,
        });
      }

      toast({
        title: 'Message forwarded',
        description: `Sent to ${selectedTargets.length} chat(s)`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Forward error:', error);
      toast({
        title: 'Error',
        description: 'Failed to forward message',
        variant: 'destructive',
      });
    }

    setForwarding(false);
  };

  const filteredTargets = targets.filter((t) =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Forward Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-[300px] rounded-lg border p-2">
              <div className="space-y-2">
                {filteredTargets.map((target) => (
                  <div
                    key={target.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedTargets.includes(target.id)
                        ? 'bg-primary/20 border border-primary/30'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleTarget(target.id)}
                  >
                    <Checkbox
                      checked={selectedTargets.includes(target.id)}
                      onCheckedChange={() => toggleTarget(target.id)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={target.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {target.type === 'group' ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          target.name?.charAt(0).toUpperCase()
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{target.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {target.type === 'group' ? 'Group' : 'Direct chat'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleForward}
              disabled={forwarding || selectedTargets.length === 0}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {forwarding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Forward ({selectedTargets.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
