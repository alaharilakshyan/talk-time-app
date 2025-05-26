
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoToChat = () => {
    navigate('/chat');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-rose-400 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
            ChatApp
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <Button onClick={handleGoToChat}>
              Go to Chat
            </Button>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" onClick={handleLogin}>
                Login
              </Button>
              <Button onClick={handleRegister}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
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

          {!user && (
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
          <Card className="border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <CardTitle className="text-xl">Lightning Fast</CardTitle>
              <CardDescription>
                Real-time messaging with Socket.IO technology for instant delivery
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-rose-200 dark:border-rose-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <CardTitle className="text-xl">Secure & Private</CardTitle>
              <CardDescription>
                End-to-end security with JWT authentication and encrypted communications
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <CardTitle className="text-xl">Voice Calls</CardTitle>
              <CardDescription>
                Crystal clear audio calls with WebRTC technology (Coming in Day 3!)
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Development Status */}
        <Card className="max-w-4xl mx-auto border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
              <span>🚀</span>
              <span>Development Progress</span>
            </CardTitle>
            <CardDescription className="text-center">
              Follow our 3-day development journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="font-semibold text-lg">Day 1 - Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Auth system, modern UI, theme toggle, and foundation setup
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="font-semibold text-lg">Day 2 - In Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time messaging, chat UI, and Socket.IO integration
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="font-semibold text-lg">Day 3 - Planned</h3>
                <p className="text-sm text-muted-foreground">
                  Audio calls, final polish, and deployment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
