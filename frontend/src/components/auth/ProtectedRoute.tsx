'use client'

import { useAuth } from "@/contexts/AuthContext"
import {useEffect, useState} from 'react';

interface ProtectedRouteProps {
    children : React.ReactNode;
    fallback?: React.ReactNode;
    requireVerification?: boolean;
}

export default function ProtectedRoute({ 
    children, 
    fallback,
    requireVerification = false 
  }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const [showFallback, setShowFallback] = useState(false);
  
    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          setShowFallback(true);
        } else if (requireVerification && !user?.verified) {
          setShowFallback(true);
        } else {
          setShowFallback(false);
        }
      }
    }, [isAuthenticated, isLoading, user?.verified, requireVerification]);
  
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
  
    if (showFallback) {
      return (
        fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {!isAuthenticated ? 'Authentication Required' : 'Email Verification Required'}
              </h2>
              <p className="text-gray-600">
                {!isAuthenticated 
                  ? 'Please log in to access this page.' 
                  : 'Please verify your email address to continue.'
                }
              </p>
            </div>
          </div>
        )
      );
    }
  
    return <>{children}</>;
  }