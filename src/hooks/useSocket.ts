
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: {
        token
      },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.IO as:', newSocket.id);
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Successfully connected to chat server",
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Disconnected from server",
        variant: "destructive"
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('⚠️ Connection Error:', error.message);
      setIsConnected(false);
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive"
      });
    });

    newSocket.on('receive_message', (message) => {
      console.log('📥 New message received:', message);
      // This will be handled by the ChatInterface component
    });

    newSocket.on('user_online', ({ userId }) => {
      console.log('🟢 User online:', userId);
    });

    newSocket.on('user_offline', ({ userId }) => {
      console.log('🔴 User offline:', userId);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token, toast]);

  const sendMessage = (receiverId: string, text: string) => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      socket.emit('send_message', { receiverId, text }, (response: any) => {
        console.log('📤 Message response:', response);
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error || 'Failed to send message'));
        }
      });
    });
  };

  return { socket, isConnected, sendMessage };
};
