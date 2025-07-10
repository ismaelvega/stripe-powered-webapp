'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Book, CreditCard, X } from 'lucide-react';

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    title: 'Mis cursos',
    href: '/dashboard/cursos',
    icon: Book,
  },
  {
    title: 'Mis Métodos de pago',
    href: '/dashboard/metodos-pago',
    icon: CreditCard,
  },
];

export default function Sidebar({ className, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Close mobile menu when clicking outside or on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${className}
      `}>
        <div className="p-4">
          {/* Mobile Close Button */}
          <div className="flex justify-end md:hidden mb-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? item.href.includes('metodos-pago')
                        ? 'bg-green-100 text-green-800 relative border-l-4 border-green-500'
                        : 'bg-orange-100 text-orange-800 relative border-l-4 border-orange-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    // Close mobile menu when clicking on navigation item
                    if (onClose) onClose();
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
