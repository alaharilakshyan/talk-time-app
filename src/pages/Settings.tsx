import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateProfile({ username, bio });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

    try {
      await updateProfile({ avatar_url: data.publicUrl });
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setUploading(false);
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingBackground(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/background-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload background",
        variant: "destructive",
      });
      setUploadingBackground(false);
      return;
    }

    const { data } = supabase.storage.from('chat-files').getPublicUrl(filePath);
    
    // Store background URL in localStorage
    localStorage.setItem('chatBackground', data.publicUrl);
    
    toast({
      title: "Success",
      description: "Chat background updated successfully",
    });
    setUploadingBackground(false);
  };

  if (!user) return null;

  return (
    <div className="container max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Card className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Label htmlFor="avatar">
                <Button variant="outline" disabled={uploading} asChild>
                  <span className="cursor-pointer">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Change Avatar
                  </span>
                </Button>
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <div>
              <Label htmlFor="usertag">User Tag</Label>
              <Input
                id="usertag"
                value={`#${user.user_tag}`}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Chat Customization</h2>
          
          <div>
            <Label htmlFor="background">Chat Background</Label>
            <Input
              id="background"
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              className="hidden"
            />
            <Label htmlFor="background">
              <Button variant="outline" disabled={uploadingBackground} asChild className="w-full mt-2">
                <span className="cursor-pointer">
                  {uploadingBackground ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Chat Background
                </span>
              </Button>
            </Label>
            <p className="text-xs text-muted-foreground mt-2">
              Upload an image to customize your chat background
            </p>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              localStorage.removeItem('chatBackground');
              toast({
                title: "Success",
                description: "Chat background reset to default",
              });
            }}
          >
            Reset to Default Background
          </Button>
        </Card>
      </div>
  );
};

export default Settings;
