import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Search, UserPlus, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  username: string;
  user_tag: string;
  avatar_url: string | null;
  friendStatus?: 'none' | 'pending' | 'accepted';
}

export const UserSearch = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return;

    setSearching(true);
    const [username, tag] = searchQuery.includes('#') 
      ? searchQuery.split('#') 
      : [searchQuery, ''];

    let query = supabase
      .from('profiles')
      .select('id, username, user_tag, avatar_url')
      .neq('id', user.id)
      .ilike('username', `%${username}%`);

    if (tag) {
      query = query.eq('user_tag', tag);
    }

    const { data, error } = await query.limit(10);

    if (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } else {
      const resultsWithStatus = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: friendData } = await supabase
            .from('friends')
            .select('status')
            .or(`and(user_id.eq.${user.id},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${user.id})`)
            .maybeSingle();

          let friendStatus: 'none' | 'pending' | 'accepted' = 'none';
          if (friendData?.status === 'accepted') {
            friendStatus = 'accepted';
          } else if (friendData?.status === 'pending') {
            friendStatus = 'pending';
          }

          return {
            ...profile,
            friendStatus,
          };
        })
      );
      setResults(resultsWithStatus);
    }
    setSearching(false);
  };

  const handleSendRequest = async (friendId: string) => {
    if (!user) return;

    setSendingRequest(friendId);
    const { error } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending',
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "Friend request already sent" 
          : "Failed to send friend request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Friend request sent",
      });
      setResults(results.map(r => 
        r.id === friendId ? { ...r, friendStatus: 'pending' as const } : r
      ));
    }
    setSendingRequest(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username or username#tag"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <Card key={result.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={result.avatar_url || undefined} />
                  <AvatarFallback>
                    {result.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{result.username}</p>
                  <p className="text-sm text-muted-foreground">
                    #{result.user_tag}
                  </p>
                </div>
              </div>
              {result.friendStatus === 'accepted' ? (
                <Button size="sm" variant="outline" disabled>
                  Friends
                </Button>
              ) : result.friendStatus === 'pending' ? (
                <Button size="sm" variant="outline" disabled>
                  Pending
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleSendRequest(result.id)}
                  disabled={sendingRequest === result.id}
                >
                  {sendingRequest === result.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friend
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
