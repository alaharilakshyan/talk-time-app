
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: MessageCircle,
      title: "Real-time Messaging",
      description: "Instant message delivery with socket connections for seamless communication.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "User Management",
      description: "See who's online, manage contacts, and track user presence efficiently.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance with intelligent caching and modern architecture.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption with JWT authentication for maximum security.",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Hero Content */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium">Welcome to ChatBuzz</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Connect & Chat
              </span>
              <br />
              <span className="text-3xl sm:text-4xl md:text-6xl text-foreground/80">in Real-time</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Experience seamless communication with ChatBuzz. 
              Secure, fast, and beautifully designed for modern messaging.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up px-4">
            <Button 
              asChild 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 px-8 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 group"
            >
              <Link to="/chat">
                Start Chatting
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm hover:bg-emerald-500/10 px-8 py-6 text-lg rounded-2xl"
            >
              Learn More
            </Button>
          </div>

          {/* User Welcome */}
          {user && (
            <div className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 max-w-md mx-auto animate-bounce-subtle">
              <p className="text-base sm:text-lg">
                Welcome back, <span className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{user.username}</span>! 
                Ready to continue your conversations?
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Why Choose ChatBuzz?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Discover the features that make ChatBuzz the perfect choice for modern communication.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="group relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50 hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-2xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border-emerald-500/20 p-6 sm:p-8 rounded-3xl">
            <CardContent className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Ready to Get Started?
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground">
                Join thousands of users already experiencing the future of messaging with ChatBuzz.
              </p>
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 px-8 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300"
              >
                <Link to="/chat">
                  Open ChatBuzz Now
                  <MessageCircle className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
