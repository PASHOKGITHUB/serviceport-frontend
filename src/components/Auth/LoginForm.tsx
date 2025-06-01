'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/useAuth';
import type { LoginRequest } from '@/domain/entities/auth';

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();

  const [formData, setFormData] = useState<LoginRequest>({
    userName: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await loginMutation.mutateAsync(formData);
      router.push('/dashboard');
    } catch (err) {
        console.error('Error during login:', err);
      // Error is handled in the mutation
    }
  };

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mb-4">
            <div className="font-bold text-2xl sm:text-3xl">
              <span className="text-red-600">SERVICE</span>
              <span className="text-gray-900">HUB</span>
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
          <p className="text-gray-600 text-sm">Sign in to your account to continue</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-medium">Username</Label>
              <Input
                id="userName"
                type="text"
                value={formData.userName}
                onChange={(e) => handleInputChange('userName', e.target.value)}
                placeholder="Enter your username"
                className="h-10"
                required
                disabled={loginMutation.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                className="h-10"
                required
                disabled={loginMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 h-10"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="text-center text-sm text-gray-500">
            Contact your administrator for access
          </div>
        </CardContent>
      </Card>
    </div>
  );
}