'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Save, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useStaffMember, useUpdateStaff } from '@/hooks/useStaff';
import { useBranches } from '@/hooks/useBranches';
import { SkeletonForm } from '@/components/ui/skeleton-form';
import type { UpdateStaffRequest, StaffRole } from '@/domain/entities/staff';
import type { ApiError } from '@/types/error';

interface StaffEditFormProps {
  staffId: string;
}

interface ValidationErrors {
  staffName?: string;
  contactNumber?: string;
  role?: string;
  branch?: string;
  address?: string;
}

export default function StaffEditForm({ staffId }: StaffEditFormProps) {
  const router = useRouter();
  const { data: staff, isLoading } = useStaffMember(staffId);
  const { data: branches = [] } = useBranches();
  const updateStaffMutation = useUpdateStaff();

  const [formData, setFormData] = useState<UpdateStaffRequest>({
    staffName: '',
    contactNumber: '',
    role: 'Staff',
    branch: '',
    address: '',
    action: 'Active'
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

useEffect(() => {
  if (staff && branches.length > 0) {
    let branchId = '';
    
    if (staff.branch) {
      if (typeof staff.branch === 'object' && staff.branch._id) {
        branchId = staff.branch._id;
      } else if (typeof staff.branch === 'string') {
        branchId = staff.branch;
      }
    }
    
    console.log('Setting branch ID:', branchId);
    console.log('Available branches:', branches);
    
    setFormData({
      staffName: staff.staffName || '',
      contactNumber: staff.contactNumber || '',
      role: staff.role || 'Staff',
      branch: branchId,
      address: staff.address || '',
      action: staff.action || 'Active'
    });
  }
}, [staff, branches]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.staffName?.trim()) {
      errors.staffName = 'Full name is required';
    }

    if (!formData.contactNumber?.trim()) {
      errors.contactNumber = 'Contact number is required';
    } else if (formData.contactNumber.replace(/\D/g, '').length < 10) {
      errors.contactNumber = 'Contact number must be at least 10 digits';
    }

    if (!formData.role) {
      errors.role = 'Please select a role';
    }

    if (!formData.branch) {
      errors.branch = 'Please select a branch';
    }

    if (!formData.address?.trim()) {
      errors.address = 'Address is required';
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
      await updateStaffMutation.mutateAsync({
        id: staffId,
        data: formData
      });
      toast.success('Staff member updated successfully!');
      router.push('/staff');
    } catch (err) {
      console.error('Error updating staff:', err);
      const error= err as ApiError;
      
      if (error?.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes('Contact number must be at least 10 digits')) {
          setValidationErrors({ contactNumber: 'Contact number must be at least 10 digits' });
        }
        
        toast.error('Error', {
          description: errorMessage,
        });
      } else {
        toast.error('Failed to update staff member. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const inputClasses = "h-11 w-full px-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500";
  const errorInputClasses = "border-red-500 focus:border-red-500 focus:ring-red-500";

  // Helper function to get selected branch name
  const getSelectedBranchName = () => {
    if (formData.branch) {
      const selectedBranch = branches.find(b => b._id === formData.branch);
      return selectedBranch?.branchName || 'Select branch';
    }
    return 'Select branch';
  };

  if (isLoading) {
    return <SkeletonForm />;
  }

  if (!staff) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-black mb-2">Staff member not found</h2>
        <p className="text-gray-600 mb-4">The staff member you&apos;re trying to edit doesn&apos;t exist.</p>
        <Link href="/staff">
          <Button className="bg-amber-700 hover:bg-amber-800 text-white">
            Back to Staff List
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
            <Link href="/staff" className="text-gray-600 hover:text-gray-900 transition-colors">
              Staff
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-amber-700 font-medium">Edit Staff Details</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleCancel}
              type="button" 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              disabled={updateStaffMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {updateStaffMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Staff Details Card */}
          <Card className="shadow-sm border-gray-200 overflow-hidden bg-transparent rounded-none">
            <CardHeader className="py-6 bg-[#EFEAE3] w-full m-0 rounded-none">
              <CardTitle className="text-lg text-center text-black font-medium">Staff Details</CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-transparent">
              <div className="space-y-8">
                {/* First Row - Full Name and Contact Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="fullName" className="text-sm font-medium text-black">
                      Full name
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.staffName}
                      onChange={(e) => {
                        setFormData({ ...formData, staffName: e.target.value });
                        if (validationErrors.staffName) {
                          setValidationErrors({ ...validationErrors, staffName: undefined });
                        }
                      }}
                      placeholder="Full name"
                      className={`${inputClasses} ${
                        validationErrors.staffName ? errorInputClasses : ''
                      }`}
                      required
                    />
                    {validationErrors.staffName && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationErrors.staffName}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="contactNumber" className="text-sm font-medium text-black">
                      Contact number
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
                      placeholder="Phone number"
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

                {/* Second Row - Select Role and Branch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 w-full">
                    <Label htmlFor="selectRole" className="text-sm font-medium text-black">
                      Select Role
                    </Label>
                    <div className="w-full">
                      <Select 
                        value={formData.role} 
                        onValueChange={(value: StaffRole) => {
                          setFormData({ ...formData, role: value });
                          if (validationErrors.role) {
                            setValidationErrors({ ...validationErrors, role: undefined });
                          }
                        }}
                      >
                        <SelectTrigger 
                          id="selectRole"
                          className={`${inputClasses} ${
                            validationErrors.role ? errorInputClasses : ''
                          }`}
                        >
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="Technician">Technician</SelectItem>
                          <SelectItem value="Staff">Staff</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {validationErrors.role && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationErrors.role}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 w-full">
                    <Label htmlFor="branch" className="text-sm font-medium text-black">
                      Branch
                    </Label>
                    <div className="w-full">
                      <Select 
                        value={formData.branch} 
                        onValueChange={(value) => {
                          setFormData({ ...formData, branch: value });
                          if (validationErrors.branch) {
                            setValidationErrors({ ...validationErrors, branch: undefined });
                          }
                        }}
                      >
                        <SelectTrigger 
                          id="branch"
                          className={`${inputClasses} ${
                            validationErrors.branch ? errorInputClasses : ''
                          }`}
                        >
                          <SelectValue placeholder="Select branch">
                            {getSelectedBranchName()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {branches.map((branch) => (
                            <SelectItem key={branch._id} value={branch._id}>
                              {branch.branchName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {validationErrors.branch && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationErrors.branch}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Third Row - Address (Full Width) */}
                <div className="space-y-3">
                  <Label htmlFor="address" className="text-sm font-medium text-black">
                    Address
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
                    placeholder="ABC HOUSE BCD TOWN EFG POST HIJ COLONY,ABC HOUSE BCD TOWN EFG POST HIJ COLONY"
                    className={`min-h-[120px] w-full px-3 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                      validationErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    required
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