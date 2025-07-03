'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Code, Users, Star, LogOut, User } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

export default function Home() {
 const { isAuthenticated, user, logout, isLoading } = useAuth();
 const [authModalOpen, setAuthModalOpen] = useState(false);
 const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

 const openAuthModal = (mode: 'login' | 'register') => {
   setAuthMode(mode);
   setAuthModalOpen(true);
 };

 if (isLoading) {
  console.log("Loading true")
   return (
     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
     </div>
   );
 }

 return (
   <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
     {/* Navigation */}
     <nav className="bg-white shadow-sm">
       <div className="container mx-auto px-4 py-4">
         <div className="flex justify-between items-center">
           <div className="flex items-center space-x-2">
             <Code className="w-8 h-8 text-blue-600" />
             <span className="text-xl font-bold text-gray-900">DevFlow</span>
           </div>
           
           {isAuthenticated ? (
             <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2">
                 <User className="w-5 h-5 text-gray-600" />
                 <span className="text-gray-700">
                   Welcome, {user?.firstName || user?.username}!
                 </span>
                 {!user?.verified && (
                   <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                     Unverified
                   </span>
                 )}
               </div>
               <button
                 onClick={logout}
                 className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
               >
                 <LogOut className="w-4 h-4" />
                 <span>Logout</span>
               </button>
             </div>
           ) : (
             <div className="flex space-x-4">
               <button
                 onClick={() => openAuthModal('login')}
                 className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
               >
                 Sign In
               </button>
               <button
                 onClick={() => openAuthModal('register')}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 Get Started
               </button>
             </div>
           )}
         </div>
       </div>
     </nav>

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
               🎉 You're logged in successfully!
             </h3>
             <p className="text-gray-600">
               Your authentication system is working perfectly. Ready to build amazing features!
             </p>
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