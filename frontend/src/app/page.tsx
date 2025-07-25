'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Code, Users, Star, LogOut, User, FolderOpen, Settings } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to DevFlow
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The ultimate platform for developers to showcase projects, get peer reviews, and discover opportunities
          </p>
          
          {isAuthenticated && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome back, {user?.firstName || user?.username}!
              </h3>
              <p className="text-gray-600 mb-4">
                Ready to showcase your projects and connect with fellow developers?
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/projects/new"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Project
                </Link>
              </div>
              {!user?.verified && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    📧 Don't forget to verify your email address to unlock all features.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Code className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Showcase Projects</h3>
            <p className="text-gray-600">Display your best work with GitHub integration</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Peer Reviews</h3>
            <p className="text-gray-600">Get valuable feedback from fellow developers</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Find Opportunities</h3>
            <p className="text-gray-600">Connect with recruiters and dream jobs</p>
          </div>
        </div>
        
        {!isAuthenticated && (
          <div className="text-center mt-12">
            <button
              onClick={() => openAuthModal('register')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition mr-4"
            >
              Get Started
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 transition"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </main>
  );
}