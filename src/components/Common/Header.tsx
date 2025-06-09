'use client';

import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Menu } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { user, setUser } = useAuthStore();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  // Update store user when currentUser is fetched
  useEffect(() => {
    if (currentUser && (!user || user.userName !== currentUser.userName)) {
      console.log('🔄 Header: Updating user data from API');
      setUser(currentUser);
    }
  }, [currentUser, user, setUser]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleMobileMenuClick = () => {
    // Placeholder for mobile menu functionality
    console.log('Mobile menu clicked');
  };

  // Use currentUser from API first, then fall back to store user
  const displayUser = currentUser || user;
  
  // Log user data for debugging
  console.log('🎯 Header user data:', {
    currentUser: currentUser?.userName,
    storeUser: user?.userName,
    displayUser: displayUser?.userName,
    isLoading: isUserLoading
  });

  // Generate user initials
  const getUserInitials = (userName?: string) => {
    if (!userName) return 'U';
    return userName.slice(0, 2).toUpperCase();
  };

  // Format role for display
  const formatRole = (role?: string) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-20 z-30">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Logo - visible on desktop */}
          <div className="hidden lg:flex items-center mr-8">
            <Image 
              src="/logo.svg" 
              alt="CAMERA PORT" 
              width={200}
              height={50}
              // className="h-18 w-50"
            />
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={handleMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {title && (
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Only show role, no username */}
          <div className="text-right hidden sm:block">
            <div className="text-sm text-gray-600 font-medium">
              {isUserLoading ? (
                <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
              ) : (
                formatRole(displayUser?.role)
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-amber-600 text-white text-xs sm:text-sm">
                    {getUserInitials(displayUser?.role)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 shadow-lg">
              <DropdownMenuLabel className="text-gray-900">
                <div className="sm:hidden">
                  {/* On mobile, show username in dropdown */}
                  <div className="font-medium text-gray-900">
                    {isUserLoading ? 'Loading...' : (displayUser?.userName || 'Unknown User')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {isUserLoading ? 'Loading...' : formatRole(displayUser?.role)}
                  </div>
                </div>
                <div className="hidden sm:block">My Account</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-900">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? 'Logging out...' : 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}