'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronRight, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useCreateStaff } from '@/hooks/useStaff';
import { useBranches } from '@/hooks/useBranches';
import type { CreateStaffRequest, StaffRole } from '@/domain/entities/staff';

interface ValidationErrors {
  staffName?: string;
  contactNumber?: string;
  role?: string;
  branch?: string;
  address?: string;
}

export default function CreateStaffForm() {
  const router = useRouter();
  const { data: branches = [] } = useBranches();
  const createStaffMutation = useCreateStaff();

  const [formData, setFormData] = useState<CreateStaffRequest>({
    staffName: '',
    contactNumber: '',
    role: 'Staff',
    branch: '',
    address: '',
    action: 'Active',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Full name validation
    if (!formData.staffName.trim()) {
      errors.staffName = 'Full name is required';
    }

    // Contact number validation
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required';
    } else if (formData.contactNumber.replace(/\D/g, '').length < 10) {
      errors.contactNumber = 'Contact number must be at least 10 digits';
    }

    // Role validation
    if (!formData.role) {
      errors.role = 'Please select a role';
    }

    // Branch validation
    if (!formData.branch) {
      errors.branch = 'Please select a branch';
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error('Validation Error', {
        description: 'Please fix the errors below and try again.',
      });
      return;
    }
    
    try {
      await createStaffMutation.mutateAsync(formData);
      toast.success('Staff member created successfully!');
      router.push('/staff');
    } catch (err: any) {
      console.error('Error creating staff:', err);
      
      // Handle validation errors from API
      if (err?.response?.data?.message) {
        const errorMessage = err.response.data.message;
        
        // Parse specific validation errors
        if (errorMessage.includes('Contact number must be at least 10 digits')) {
          setValidationErrors({ contactNumber: 'Contact number must be at least 10 digits' });
        }
        
        toast.error('Error', {
          description: errorMessage,
        });
      } else {
        toast.error('Failed to create staff member. Please try again.');
      }
    }
  };

  // Consistent styling classes for all form inputs
  const inputClasses = "h-11 px-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500";
  const errorInputClasses = "border-red-500 focus:border-red-500 focus:ring-red-500";

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
            <span className="text-amber-700 font-medium">Add Staff Details</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSubmit}
              className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              disabled={createStaffMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {createStaffMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Link href="/staff">
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
          {/* Staff Details Card */}
          <Card className="shadow-sm border-gray-200 overflow-hidden bg-transparent">
            <CardHeader className="py-8" style={{ backgroundColor: '#EFEAE3' }}>
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
                  <div className="space-y-3">
                    <Label htmlFor="selectRole" className="text-sm font-medium text-black">
                      Select Role
                    </Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value: StaffRole) => {
                        setFormData({ ...formData, role: value });
                        if (validationErrors.role) {
                          setValidationErrors({ ...validationErrors, role: undefined });
                        }
                      }}
                    >
                      <SelectTrigger className={`${inputClasses} ${
                        validationErrors.role ? errorInputClasses : ''
                      }`}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="Technician">Technician</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.role && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationErrors.role}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="branch" className="text-sm font-medium text-black">
                      Branch
                    </Label>
                    <Select 
                      value={formData.branch} 
                      onValueChange={(value) => {
                        setFormData({ ...formData, branch: value });
                        if (validationErrors.branch) {
                          setValidationErrors({ ...validationErrors, branch: undefined });
                        }
                      }}
                    >
                      <SelectTrigger className={`${inputClasses} ${
                        validationErrors.branch ? errorInputClasses : ''
                      }`}>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {branches.map((branch) => (
                          <SelectItem key={branch._id} value={branch._id}>
                            <div className="flex flex-col">
                              <span className="font-medium text-black">{branch.branchName}</span>
                              <span className="text-sm text-gray-500">{branch.location}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    className={`min-h-[120px] px-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
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