'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  Wrench,
  Users,
  Building2,
  UserCog,
  Menu,
  X
} from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/hooks/useAuth';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'staff', 'Technician', 'Staff', 'Manager'], // Available to all roles
  },
  {
    title: 'Service',
    href: '/services',
    icon: Wrench,
    roles: ['admin', 'manager', 'staff', 'Technician', 'Staff', 'Manager'], // Available to all roles
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
    roles: ['admin', 'manager', 'staff', 'Technician', 'Staff', 'Manager'], // Available to all roles
  },
  {
    title: 'Branch',
    href: '/branches',
    icon: Building2,
    roles: ['admin'], // Only for admin users
  },
  {
    title: 'Staff',
    href: '/staff',
    icon: UserCog,
    roles: ['admin'], // Only for admin users
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { data: currentUser } = useCurrentUser();

  // Use currentUser from API if available, fallback to store user
  const displayUser = currentUser || user;
  const userRole = displayUser?.role;

  // Filter sidebar items based on user role
  const filteredSidebarItems = sidebarItems.filter(item => {
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-20 left-0 h-[calc(100vh-5rem)] z-50 flex flex-col transition-transform duration-300 w-64",
        "bg-[#0A0A0A]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo section - only visible on mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.svg" 
              alt="CAMERA PORT Logo" 
              width={32}
              height={32}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation - scrollable if needed */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredSidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 transition-colors relative",
                  "font-inter font-medium text-base leading-[121%] tracking-[0.1px]",
                  isActive 
                    ? "bg-white text-amber-600 shadow-sm -mx-4 px-7" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg"
                )}
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '121%',
                  letterSpacing: '0.1px',
                  verticalAlign: 'middle',
                  borderRadius: isActive ? '50px 0 0 50px' : '12px'
                }}
                onClick={() => setIsOpen(false)} // Close on mobile
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-amber-600" : ""
                )} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}