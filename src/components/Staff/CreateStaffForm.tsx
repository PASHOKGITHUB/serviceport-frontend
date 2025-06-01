'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCreateStaff } from '@/hooks/useStaff';
import { useBranches } from '@/hooks/useBranches';
import type { CreateStaffRequest, StaffRole } from '@/domain/entities/staff';

export default function CreateStaffForm() {
  const router = useRouter();
  const { data: branches = [] } = useBranches();
  const createStaffMutation = useCreateStaff();

  const [formData, setFormData] = useState<CreateStaffRequest>({
    staffName: '',
    contactNumber: '',
    role: 'Staff',
    branch: '',
    action: 'Active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createStaffMutation.mutateAsync(formData);
      router.push('/staff');
    } catch (err) 
    {
        console.error('Error creating staff:', err);
      // Error is handled in the mutation
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/staff" className="text-gray-600 hover:text-gray-900 transition-colors">
          Staff
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-red-600 font-medium">Add Staff Details</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Staff Member</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 transition-colors order-2 sm:order-1"
              disabled={createStaffMutation.isPending}
            >
              {createStaffMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Link href="/staff" className="order-1 sm:order-2">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
          </div>
        </div>

        {/* Staff Details Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="text-lg text-center">Staff Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.staffName}
                    onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                    placeholder="Enter full name"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber" className="text-sm font-medium">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="Enter contact number"
                    className="h-10"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="selectRole" className="text-sm font-medium">Select Role *</Label>
                  <Select value={formData.role} onValueChange={(value: StaffRole) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technician">Technician</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-sm font-medium">Branch *</Label>
                  <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{branch.branchName}</span>
                            <span className="text-sm text-gray-500">{branch.location}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}