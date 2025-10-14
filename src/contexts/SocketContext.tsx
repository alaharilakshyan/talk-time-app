import React, { createContext, useContext } from 'react';

interface SocketContextType {
  socket: null;
  isConnected: boolean;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Placeholder - will be replaced with Supabase Realtime
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SocketContext.Provider value={{ socket: null, isConnected: true, onlineUsers: new Set() }}>
      {children}
    </SocketContext.Provider>
  );
};
