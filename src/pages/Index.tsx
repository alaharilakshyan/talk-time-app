
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Shield, Zap, Users } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const { isConnected, onlineUsers } = useSocket();
  const navigate = useNavigate();

  const handleStartChatting = () => {
    navigate('/chat');
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Real-time Chat
              </span>
              <br />
              <span className="text-foreground">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect instantly with friends and colleagues through our modern, secure chat platform. 
              Built with cutting-edge technology for the best real-time experience.
            </p>
          </div>

          {user ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-4">
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {onlineUsers.size} users online
                </span>
              </div>
              <Button size="lg" onClick={handleStartChatting} className="text-lg px-8">
                <MessageCircle className="h-5 w-5 mr-2" />
                Start Chatting
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={handleSignIn} className="text-lg px-8">
                Sign In
              </Button>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Lightning Fast</CardTitle>
              <CardDescription>
                Real-time messaging with Socket.IO technology for instant delivery
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Secure & Private</CardTitle>
              <CardDescription>
                End-to-end security with JWT authentication and encrypted communications
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-xl">User Presence</CardTitle>
              <CardDescription>
                See who's online and track user activity in real-time
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Welcome Card for logged in users */}
        {user && (
          <Card className="max-w-2xl mx-auto border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-center text-xl">
                Welcome back, <span className="text-blue-600 dark:text-blue-400">{user.username}</span>!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your chat experience is ready. Connect with others and start conversations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Real-time Chat</h3>
                  <p className="text-xs text-muted-foreground">Instant messaging with live status</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Online Users</h3>
                  <p className="text-xs text-muted-foreground">See who's available to chat</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
