'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useBranch, useUpdateBranch } from '@/hooks/useBranches';
import { SkeletonForm } from '@/components/ui/skeleton-form';
import type { UpdateBranchRequest } from '@/domain/entities/branch';
import type { ApiError } from '@/types/error';

interface BranchEditFormProps {
  branchId: string;
}

interface ValidationErrors {
  branchName?: string;
  contactNumber?: string;
  location?: string;
  address?: string;
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
    isActive: true
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (branch) {
      setFormData({
        branchName: branch.branchName || '',
        location: branch.location || '',
        address: branch.address || '',
        contactNumber: branch.phoneNumber || '',
        isActive: branch.isActive ?? true
      });
    }
  }, [branch]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.branchName?.trim()) {
      errors.branchName = 'Branch name is required';
    }

    if (!formData.contactNumber?.trim()) {
      errors.contactNumber = 'Contact number is required';
    } else if (formData.contactNumber.replace(/\D/g, '').length < 10) {
      errors.contactNumber = 'Contact number must be at least 10 digits';
    }

    if (!formData.location?.trim()) {
      errors.location = 'Location is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setValidationErrors({});

    if (!validateForm()) {
      toast.error('Validation Error', {
        description: 'Please fix the errors below and try again.',
      });
      return;
    }
    
    try {
      await updateBranchMutation.mutateAsync({
        id: branchId,
        data: formData
      });
      toast.success('Branch updated successfully!');
      router.push('/branches');
    } catch (err) {
      console.error('Error updating branch:', err);
      
      const error = err as ApiError;
      
      if (error?.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes('Contact number must be at least 10 digits')) {
          setValidationErrors({ contactNumber: 'Contact number must be at least 10 digits' });
        }
        
        toast.error('Error', {
          description: errorMessage,
        });
      } else {
        toast.error('Failed to update branch. Please try again.');
      }
    }
  };

  const inputClasses = "h-11 w-full px-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500";
  const errorInputClasses = "border-red-500 focus:border-red-500 focus:ring-red-500";

  if (isLoading) {
    return <SkeletonForm />;
  }

  if (!branch) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-black mb-2">Branch not found</h2>
        <p className="text-gray-600 mb-4">The branch you&apos;re trying to edit doesn&apos;t exist.</p>
        <Link href="/branches">
          <Button className="bg-amber-700 hover:bg-amber-800 text-white">
            Back to Branches
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with buttons */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link href="/branches" className="text-gray-600 hover:text-gray-900 transition-colors">
              Branches
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link href={`/branches/view/${branchId}`} className="text-gray-600 hover:text-gray-900 transition-colors">
              View Branch Details
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-amber-700 font-medium">Edit Branch Details</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSubmit}
              className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              disabled={updateBranchMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {updateBranchMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Link href="/branches">
              <Button 
                type="button" 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Branch Details Card */}
          <Card className="shadow-sm border-gray-200 overflow-hidden bg-transparent rounded-none">
            <CardHeader className="py-6 bg-[#EFEAE3]">
              <CardTitle className="text-lg text-center text-black font-medium">Branch Details</CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-transparent">
              <div className="space-y-8">
                {/* First Row - Branch Name and Contact Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="branchName" className="text-sm font-medium text-black">
                      Branch Name
                    </Label>
                    <Input
                      id="branchName"
                      value={formData.branchName}
                      onChange={(e) => {
                        setFormData({ ...formData, branchName: e.target.value });
                        if (validationErrors.branchName) {
                          setValidationErrors({ ...validationErrors, branchName: undefined });
                        }
                      }}
                      placeholder="Enter branch name"
                      className={`${inputClasses} ${
                        validationErrors.branchName ? errorInputClasses : ''
                      }`}
                      required
                    />
                    {validationErrors.branchName && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationErrors.branchName}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="contactNumber" className="text-sm font-medium text-black">
                      Contact Number
                    </Label>
                    <Input
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, contactNumber: e.target.value });
                        if (validationErrors.contactNumber) {
                          setValidationErrors({ ...validationErrors, contactNumber: undefined });
                        }
                      }}
                      placeholder="Enter contact number"
                      className={`${inputClasses} ${
                        validationErrors.contactNumber ? errorInputClasses : ''
                      }`}
                      required
                    />
                    {validationErrors.contactNumber && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationErrors.contactNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Second Row - Location and Manager */}
                  <div className="space-y-3">
                    <Label htmlFor="location" className="text-sm font-medium text-black">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => {
                        setFormData({ ...formData, location: e.target.value });
                        if (validationErrors.location) {
                          setValidationErrors({ ...validationErrors, location: undefined });
                        }
                      }}
                      placeholder="Enter location"
                      className={`${inputClasses} ${
                        validationErrors.location ? errorInputClasses : ''
                      }`}
                      required
                    />
                    {validationErrors.location && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationErrors.location}</span>
                      </div>
                    )}
                  </div>
                  {/* <div className="space-y-3">
                    <Label htmlFor="manager" className="text-sm font-medium text-black">
                      Manager (Optional)
                    </Label>
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      placeholder="Enter manager name"
                      className={inputClasses}
                    />
                  </div> */}

                {/* Fourth Row - Address (Full Width) */}
                <div className="space-y-3">
                  <Label htmlFor="address" className="text-sm font-medium text-black">
                    Address (Optional)
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (validationErrors.address) {
                        setValidationErrors({ ...validationErrors, address: undefined });
                      }
                    }}
                    placeholder="Enter full address including building, street, city, pin code"
                    className={`min-h-[120px] w-full px-3 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                      validationErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {validationErrors.address && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{validationErrors.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}