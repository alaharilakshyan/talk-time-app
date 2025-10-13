
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
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Hero Content */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Welcome to the future of messaging</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold gradient-text leading-tight">
              Connect & Chat
              <br />
              <span className="text-4xl md:text-6xl">in Real-time</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience seamless communication with our modern chat platform. 
              Built with cutting-edge technology for instant, secure messaging.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group"
            >
              <Link to="/chat">
                Start Chatting
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-8 py-6 text-lg rounded-xl"
            >
              Learn More
            </Button>
          </div>

          {/* User Welcome */}
          {user && (
            <div className="mt-12 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 max-w-md mx-auto animate-bounce-subtle">
              <p className="text-lg">
                Welcome back, <span className="font-semibold gradient-text">{user.username}</span>! 
                Ready to continue your conversations?
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold gradient-text">
              Why Choose TalkTime?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the features that make our platform the perfect choice for modern communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="group relative overflow-hidden bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border-white/20 p-8">
            <CardContent className="space-y-6">
              <h3 className="text-3xl font-bold gradient-text">
                Ready to Get Started?
              </h3>
              <p className="text-lg text-muted-foreground">
                Join thousands of users already experiencing the future of messaging.
              </p>
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
              >
                <Link to="/chat">
                  Open Chat Now
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
