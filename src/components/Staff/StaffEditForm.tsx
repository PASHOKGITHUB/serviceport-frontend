'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useStaffMember, useUpdateStaff } from '@/hooks/useStaff';
import { useBranches } from '@/hooks/useBranches';
import type { UpdateStaffRequest } from '@/domain/entities/staff';

interface StaffEditFormProps {
  staffId: string;
}

export default function StaffEditForm({ staffId }: StaffEditFormProps) {
  const router = useRouter();
  const { data: staff, isLoading } = useStaffMember(staffId);
  const { data: branches = [] } = useBranches();
  const updateStaffMutation = useUpdateStaff();

  const [formData, setFormData] = useState<UpdateStaffRequest>({
    staffName: '',
    contactNumber: '',
    role: undefined,
    specialization: '',
    branch: '',
    isActive: true
  });

  const [isFloatingVisible, setIsFloatingVisible] = useState(false);

  // Populate form with staff data
  useEffect(() => {
    if (staff) {
      setFormData({
        staffName: staff.staffName || '',
        contactNumber: staff.contactNumber || '',
        role: staff.role,
        specialization: staff.specialization || '',
        branch: staff.branch?._id || '',
        isActive: staff.isActive ?? true
      });
    }
  }, [staff]);

  // Show floating buttons on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsFloatingVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (field: keyof UpdateStaffRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert "none" back to empty string for the API
      const dataToSubmit = {
        ...formData,
        branch: formData.branch === 'none' ? '' : formData.branch
      };
      
      await updateStaffMutation.mutateAsync({
        id: staffId,
        data: dataToSubmit
      });
      router.push('/staff');
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  const handleCancel = () => {
    router.push('/staff');
  };

  if (isLoading) {
    return <StaffEditSkeleton />;
  }

  if (!staff) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Staff member not found</h2>
        <p className="text-gray-600 mb-4">The staff member you&apos;re trying to edit doesn&apos;t exist.</p>
        <Link href="/staff">
          <Button className="bg-red-600 hover:bg-red-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff
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
          <Link href="/staff">
            <Button variant="outline" size="sm" className="mb-2 sm:mb-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
              Edit Staff Member
            </h1>
            <p className="text-gray-600 text-sm sm:text-base break-words">
              Update staff member information
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staffName">Staff Name *</Label>
                <Input
                  id="staffName"
                  value={formData.staffName}
                  onChange={(e) => handleInputChange('staffName', e.target.value)}
                  placeholder="Enter staff name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="Enter contact number"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value as 'manager' | 'technician')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  placeholder="Enter specialization (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={formData.branch || 'none'}
                  onValueChange={(value) => handleInputChange('branch', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Branch</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.branchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Status *</Label>
                <Select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onValueChange={(value) => handleInputChange('isActive', value === 'active')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateStaffMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700"
            disabled={updateStaffMutation.isPending}
          >
            {updateStaffMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Update Staff
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
            disabled={updateStaffMutation.isPending}
            className="flex-1 bg-white shadow-lg"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-red-600 hover:bg-red-700 shadow-lg"
            disabled={updateStaffMutation.isPending}
          >
            {updateStaffMutation.isPending ? (
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

function StaffEditSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
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