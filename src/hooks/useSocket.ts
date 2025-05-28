
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
<<<<<<< HEAD
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
=======
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
>>>>>>> a2dfc819e0b2316c9b944a01fef000253f0dbcd7
    }

    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: {
        token
      },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      // Join user to their room for receiving messages
      newSocket.emit('userOnline', { userId: user.id, username: user.username });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  return socket;
};
