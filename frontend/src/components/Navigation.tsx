'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Code, User, Settings, FolderOpen, LogOut, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path);
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Code className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">DevFlow</span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/projects')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Projects
            </Link>
            <Link
              href={`/profile/${user?.username}`}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(`/profile/${user?.username}`)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Profile
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* User Avatar & Menu */}
            <div className="flex items-center space-x-3">
              <Link
                href={`/profile/${user?.username}`}
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName || user?.username}
                </span>
              </Link>

              {/* Quick Actions Dropdown */}
              <div className="flex items-center space-x-1">
                <Link
                  href="/profile/settings"
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-md"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-md"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;