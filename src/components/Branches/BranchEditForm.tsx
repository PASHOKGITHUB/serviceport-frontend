'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useBranch, useUpdateBranch } from '@/hooks/useBranches';
import type { UpdateBranchRequest } from '@/domain/entities/branch';

interface BranchEditFormProps {
  branchId: string;
}

export default function BranchEditForm({ branchId }: BranchEditFormProps) {
  const router = useRouter();
  const { data: branch, isLoading } = useBranch(branchId);
  const updateBranchMutation = useUpdateBranch();

  const [formData, setFormData] = useState<UpdateBranchRequest>({
    branchName: '',
    location: '',
    address: '',
    contactNumber: '',
    manager: '',
    isActive: true
  });

  const [isFloatingVisible, setIsFloatingVisible] = useState(false);

  // Populate form with branch data
  useEffect(() => {
    if (branch) {
      setFormData({
        branchName: branch.branchName || '',
        location: branch.location || '',
        address: branch.address || '',
        contactNumber: branch.contactNumber || '',
        manager: branch.manager || '',
        isActive: branch.isActive ?? true
      });
    }
  }, [branch]);

  // Show floating buttons on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsFloatingVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (field: keyof UpdateBranchRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateBranchMutation.mutateAsync({
        id: branchId,
        data: formData
      });
      router.push('/branches');
    } catch (error) {
      console.error('Error updating branch:', error);
    }
  };

  const handleCancel = () => {
    router.push('/branches');
  };

  if (isLoading) {
    return <BranchEditSkeleton />;
  }

  if (!branch) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-black mb-2">Branch not found</h2>
        <p className="text-gray-600 mb-4">The branch you&apos;re trying to edit doesn&apos;t exist.</p>
        <Link href="/branches">
          <Button className="bg-amber-700 hover:bg-amber-800 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Branches
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <Link href="/branches">
            <Button variant="outline" size="sm" className="mb-2 sm:mb-0 border-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black break-words">
              Edit Branch
            </h1>
            <p className="text-gray-600 text-sm sm:text-base break-words">
              Update branch information
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="hover:shadow-sm transition-shadow border-gray-200">
          <CardHeader className="bg-gray-200 rounded-t-lg">
            <CardTitle className="text-lg sm:text-xl text-black">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchName" className="text-black">Branch Name *</Label>
                <Input
                  id="branchName"
                  value={formData.branchName}
                  onChange={(e) => handleInputChange('branchName', e.target.value)}
                  placeholder="Enter branch name"
                  className="border-gray-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-black">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter location"
                  className="border-gray-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber" className="text-black">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="Enter contact number"
                  className="border-gray-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager" className="text-black">Manager</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => handleInputChange('manager', e.target.value)}
                  placeholder="Enter manager name (optional)"
                  className="border-gray-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-black">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full address (optional)"
                rows={3}
                className="border-gray-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="hover:shadow-sm transition-shadow border-gray-200">
          <CardHeader className="bg-gray-200 rounded-t-lg">
            <CardTitle className="text-lg sm:text-xl text-black">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 bg-white">
            <div className="space-y-2">
              <Label htmlFor="isActive" className="text-black">Branch Status *</Label>
              <Select
                value={formData.isActive ? 'active' : 'inactive'}
                onValueChange={(value) => handleInputChange('isActive', value === 'active')}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateBranchMutation.isPending}
            className="border-gray-300"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-amber-700 hover:bg-amber-800 text-white"
            disabled={updateBranchMutation.isPending}
          >
            {updateBranchMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Update Branch
          </Button>
        </div>
      </form>

      {/* Floating Action Buttons for Mobile */}
      <div className={`sm:hidden fixed bottom-6 left-4 right-4 z-50 transition-all duration-300 ${
        isFloatingVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateBranchMutation.isPending}
            className="flex-1 bg-white shadow-lg border-gray-300"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-amber-700 hover:bg-amber-800 text-white shadow-lg"
            disabled={updateBranchMutation.isPending}
          >
            {updateBranchMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}

function BranchEditSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-gray-200">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}