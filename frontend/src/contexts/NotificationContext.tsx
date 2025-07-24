'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io as socketIO, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { Notification, NotificationResponse } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isAuthenticated && token && user) {
      const newSocket = socketIO(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
        auth: {
          token: token
        },
        autoConnect: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to notification service');
        setIsConnected(true);
        fetchNotifications(); // Load initial notifications
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from notification service');
        setIsConnected(false);
      });

      // Listen for new notifications
      newSocket.on('notification:new', (notification: Notification) => {
        console.log('New notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permission granted
        // Fix 3: Use window.Notification to explicitly reference browser API
        if (typeof window !== 'undefined' && window.Notification && window.Notification.permission === 'granted') {
          new window.Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      });

      // Listen for notification read confirmations
      newSocket.on('notification:read', (notificationId: string) => {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      });

      // Listen for all notifications marked as read
      newSocket.on('notification:allRead', () => {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, token, user]);

  // Request browser notification permission
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined' && window.Notification && window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: NotificationResponse = await response.json();
        setNotifications(data.notifications);
        
        // Calculate unread count
        const unread = data.notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Emit WebSocket event for real-time update
        socket?.emit('notification:read', notificationId);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [token, socket]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Emit WebSocket event for real-time update
        socket?.emit('notification:readAll');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [token, socket]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        // Update unread count if the deleted notification was unread
        setUnreadCount(prev => {
          const deletedNotification = notifications.find(n => n.id === notificationId);
          return deletedNotification && !deletedNotification.read ? prev - 1 : prev;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [token, notifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};