
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useToast } from '@/hooks/use-toast';

export const ChatDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You've been logged out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4">
    {/* Header */}
        <header className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-rose-400 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">C</span>
        </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
          ChatApp
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>

        {/* Welcome Card */}
        <Card className="max-w-2xl mx-auto mb-8 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Welcome back, <span className="text-orange-600 dark:text-orange-400">{user?.username}</span>!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your real-time chat experience is ready. Day 1 setup is complete!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  ✅
                </div>
                <h3 className="font-semibold text-sm mb-1">Authentication</h3>
                <p className="text-xs text-muted-foreground">Secure JWT-based login system</p>
              </div>
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  🎨
                </div>
                <h3 className="font-semibold text-sm mb-1">Modern UI</h3>
                <p className="text-xs text-muted-foreground">ShadCN components with warm theme</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  🚀
                </div>
                <h3 className="font-semibold text-sm mb-1">Ready for Day 2</h3>
                <p className="text-xs text-muted-foreground">Socket.IO client foundation set</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">🛠️ Next Steps (Day 2)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                <span>Set up Node.js + Express backend with MongoDB</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
                <span>Implement Socket.IO real-time messaging</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                <span>Build chat UI with message bubbles</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span>Add online user presence tracking</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
  </div>  
  );
};
