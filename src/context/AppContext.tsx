import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  username: string;
  email: string;
}

interface Room {
  id: string;
  title: string;
  hostId: string;
  participants: { userId: string; isSpeaker: boolean; isMuted: boolean }[];
  isPublic: boolean;
}

interface AppContextType {
  currentUser: User | null;
  rooms: Room[];
  login: (email: string, password: string, callback: (result: { success: boolean; error?: string }) => void) => void;
  register: (username: string, email: string, password: string, callback: (result: { success: boolean; error?: string }) => void) => void;
  logout: () => void;
  createRoom: (title: string, isPublic: boolean, callback: (roomId: string | null) => void) => void;
  joinRoom: (roomId: string, callback: (success: boolean) => void) => void;
  leaveRoom: (roomId: string) => void;
  toggleMute: (roomId: string, userId: string) => void;
  promoteToSpeaker: (roomId: string, userId: string) => void;
  kickUser: (roomId: string, userId: string) => void;
  socket: Socket | null;
  isConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket] = useState<Socket>(() =>
    io('http://localhost:3001', {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  );

  useEffect(() => {
    console.log('Initializing Socket.IO client...');
    socket.connect();

    socket.on('connect', () => {
      console.log('Socket connected successfully:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    });

    socket.on('reconnect', (attempt) => {
      console.log('Socket reconnected after', attempt, 'attempts');
      setIsConnected(true);
    });

    socket.on('roomsUpdated', (updatedRooms: Room[]) => {
      console.log('Received roomsUpdated:', updatedRooms);
      setRooms(updatedRooms);
    });

    return () => {
      console.log('Cleaning up Socket.IO listeners...');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('reconnect');
      socket.off('roomsUpdated');
      socket.disconnect();
    };
  }, [socket]);

  const login = (email: string, password: string, callback: (result: { success: boolean; error?: string }) => void) => {
    if (!isConnected) return callback({ success: false, error: 'Not connected to server' });
    socket.emit('login', { email, password }, ({ success, user, error }: any) => {
      console.log('Login response:', { success, user, error });
      if (success) {
        setCurrentUser(user);
        callback({ success: true });
      } else {
        callback({ success: false, error });
      }
    });
  };

  const register = (
    username: string,
    email: string,
    password: string,
    callback: (result: { success: boolean; error?: string }) => void
  ) => {
    if (!isConnected) return callback({ success: false, error: 'Not connected to server' });
    socket.emit('register', { username, email, password }, ({ success, user, error }: any) => {
      console.log('Register response:', { success, user, error });
      if (success) {
        setCurrentUser(user);
        callback({ success: true });
      } else {
        callback({ success: false, error });
      }
    });
  };

  const logout = () => {
    setCurrentUser(null);
    socket.disconnect();
  };

  const createRoom = (title: string, isPublic: boolean, callback: (roomId: string | null) => void) => {
    if (!currentUser || !isConnected) {
      console.log('createRoom failed: User not logged in or socket not connected');
      return callback(null);
    }
    console.log('Emitting createRoom:', { title, isPublic });
    socket.emit('createRoom', { title, isPublic }, (roomId: string) => {
      console.log('createRoom callback received:', roomId);
      callback(roomId);
    });
  };

  const joinRoom = (roomId: string, callback: (success: boolean) => void) => {
    if (!currentUser || !isConnected) return callback(false);
    socket.emit('joinRoom', roomId, (success: boolean) => {
      console.log('Join room response:', success);
      callback(success);
    });
  };

  const leaveRoom = (roomId: string) => {
    if (!isConnected) return;
    socket.emit('leaveRoom', roomId);
  };

  const toggleMute = (roomId: string, userId: string) => {
    if (!isConnected) return;
    socket.emit('toggleMute', { roomId, userId });
  };

  const promoteToSpeaker = (roomId: string, userId: string) => {
    if (!isConnected) return;
    socket.emit('promoteToSpeaker', { roomId, userId });
  };

  const kickUser = (roomId: string, userId: string) => {
    if (!isConnected) return;
    socket.emit('kickUser', { roomId, userId });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        rooms,
        login,
        register,
        logout,
        createRoom,
        joinRoom,
        leaveRoom,
        toggleMute,
        promoteToSpeaker,
        kickUser,
        socket,
        isConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};