import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, Users, Zap, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in w-full">
        {/* Hero Section */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
            Welcome to TalkTime
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Connect with friends and family in real-time. Experience seamless communication with our modern chat platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-xl border-primary/20 hover:border-primary/40 transition-all hover:scale-105 active:scale-95">
            <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Real-time Messaging</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Send and receive messages instantly with our fast socket-based system
            </p>
          </Card>

          <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-xl border-primary/20 hover:border-primary/40 transition-all hover:scale-105 active:scale-95">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Online Status</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              See who's online and available to chat at a glance
            </p>
          </Card>

          <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-xl border-primary/20 hover:border-primary/40 transition-all hover:scale-105 active:scale-95 sm:col-span-2 md:col-span-1">
            <Zap className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Built with modern tech for blazing fast performance
            </p>
          </Card>
        </div>

        {/* CTA */}
        {user && (
          <div className="mt-8 sm:mt-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
              asChild
            >
              <Link to="/chat">
                Start Chatting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
