
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection when user is authenticated
      // TODO: Replace with actual backend URL
      socketRef.current = io('http://localhost:3001', {
      auth: {
          token: token,
          userId: user.id,
        },
      });

      console.log('Socket.IO client initialized for Day 2 messaging');

    return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
    };
    }
  }, [user, token]);

  return socketRef.current;
};
