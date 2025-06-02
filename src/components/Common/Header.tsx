'use client';

import { useAuthStore } from '@/store/authStore';
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

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleMobileMenuClick = () => {
    // Placeholder for mobile menu functionality
    console.log('Mobile menu clicked');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-20 z-30">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Logo - visible on desktop */}
          <div className="hidden lg:flex items-center gap-2 mr-8">
            <img 
              src="/logo.svg" 
              alt="CAMERA PORT" 
              className="h-18 w-50"
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
          <div className="text-right hidden sm:block">
            <div className="font-medium text-gray-900 text-sm">
              {user?.userName || 'Daniel Roberts'}
            </div>
            <div className="text-xs text-gray-500">
              Receptionist
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-amber-600 text-white text-xs sm:text-sm">
                    {user?.userName?.slice(0, 2).toUpperCase() || 'DR'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 shadow-lg">
              <DropdownMenuLabel className="text-gray-900">
                <div className="sm:hidden">
                  <div className="font-medium text-gray-900">
                    {user?.userName || 'Daniel Roberts'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Receptionist
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