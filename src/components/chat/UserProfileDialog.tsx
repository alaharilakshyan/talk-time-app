import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  user_tag: string;
  avatar_url: string | null;
  bio: string | null;
}

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentUserId: string;
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  open,
  onOpenChange,
  userId,
  currentUserId,
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sharedMedia, setSharedMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && userId) {
      fetchProfileAndMedia();
    }
  }, [open, userId]);

  const fetchProfileAndMedia = async () => {
    setLoading(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch shared media
    const { data: mediaData } = await supabase
      .from('messages')
      .select('*')
      .not('file_url', 'is', null)
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (mediaData) {
      setSharedMedia(mediaData);
    }

    setLoading(false);
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar className="h-24 w-24 ring-4 ring-background">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="text-xl font-semibold">{profile.username}</h3>
                <p className="text-sm text-muted-foreground">#{profile.user_tag}</p>
                {profile.bio && (
                  <p className="text-sm mt-2 text-muted-foreground">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Shared Media */}
            <div className="space-y-2">
              <h4 className="font-medium">Shared Media ({sharedMedia.length})</h4>
              <ScrollArea className="h-48 border rounded-lg p-2">
                {sharedMedia.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {sharedMedia.map((media) => (
                      <div
                        key={media.id}
                        className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(media.file_url, '_blank')}
                      >
                        {isImage(media.file_url) ? (
                          <img
                            src={media.file_url}
                            alt={media.file_name || 'Media'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-center p-2">
                            {media.file_name || 'File'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No shared media yet
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Profile not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
