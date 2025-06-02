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
      <Card className="w-full max-w-md animate-fade-in shadow-lg border border-gray-200 overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100 p-6 text-center space-y-4">
          <div className="mb-4">
            <div className="font-bold text-2xl sm:text-3xl">
              <span className="text-amber-700">CAMERA</span>
              <span className="text-gray-900"> PORT</span>
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl text-black font-semibold">Welcome Back</CardTitle>
          <p className="text-gray-600 text-sm">Sign in to your account to continue</p>
        </CardHeader>
        <CardContent className="bg-white p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-medium text-gray-700">Username</Label>
              <Input
                id="userName"
                type="text"
                value={formData.userName}
                onChange={(e) => handleInputChange('userName', e.target.value)}
                placeholder="Enter your username"
                className="h-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                required
                disabled={loginMutation.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                className="h-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                required
                disabled={loginMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-amber-700 hover:bg-amber-800 h-10 text-white font-medium"
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