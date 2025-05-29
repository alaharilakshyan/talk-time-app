
import { useState, useCallback, useRef } from 'react';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    username: string;
    avatar: string;
  };
  receiverId: {
    _id: string;
    username: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
}

interface MessageCache {
  [conversationKey: string]: Message[];
}

export const useMessageCache = () => {
  const [cache, setCache] = useState<MessageCache>({});
  const loadingRef = useRef<Set<string>>(new Set());

  const getConversationKey = useCallback((userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('-');
  }, []);

  const getCachedMessages = useCallback((userId1: string, userId2: string) => {
    const key = getConversationKey(userId1, userId2);
    return cache[key] || [];
  }, [cache, getConversationKey]);

  const setCachedMessages = useCallback((userId1: string, userId2: string, messages: Message[]) => {
    const key = getConversationKey(userId1, userId2);
    setCache(prev => ({
      ...prev,
      [key]: messages
    }));
  }, [getConversationKey]);

  const addMessage = useCallback((message: Message) => {
    const key = getConversationKey(message.senderId._id, message.receiverId._id);
    setCache(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), message]
    }));
  }, [getConversationKey]);

  const isLoading = useCallback((userId1: string, userId2: string) => {
    const key = getConversationKey(userId1, userId2);
    return loadingRef.current.has(key);
  }, [getConversationKey]);

  const setLoading = useCallback((userId1: string, userId2: string, loading: boolean) => {
    const key = getConversationKey(userId1, userId2);
    if (loading) {
      loadingRef.current.add(key);
    } else {
      loadingRef.current.delete(key);
    }
  }, [getConversationKey]);

  const clearCache = useCallback(() => {
    setCache({});
    loadingRef.current.clear();
  }, []);

  return {
    getCachedMessages,
    setCachedMessages,
    addMessage,
    isLoading,
    setLoading,
    clearCache
  };
};
