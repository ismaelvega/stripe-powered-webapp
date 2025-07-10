'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import DemoControls from '@/components/ui/demo-controls';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar 
          isOpen={isMobileMenuOpen} 
          onClose={closeMobileMenu}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMobileMenuToggle={toggleMobileMenu} />
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
      
      <DemoControls />
    </div>
  );
}
