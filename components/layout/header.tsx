'use client';

import React, { useState } from 'react';
import { ChevronDown, User, Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { showConfirmAlert } from '@/lib/sweetalert';

interface HeaderProps {
  className?: string;
  onMobileMenuToggle?: () => void;
}

export default function Header({ className, onMobileMenuToggle }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await showConfirmAlert(
      '¿Cerrar sesión?',
      '¿Estás seguro de que quieres cerrar sesión?'
    );
    
    if (result.isConfirmed) {
      await signOut();
      router.push('/auth');
    }
  };

  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.user_metadata?.full_name || user?.email || 'Usuario'}
          </span>
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1 p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="py-1">
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </div>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
