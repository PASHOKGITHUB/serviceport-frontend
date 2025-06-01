'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCreateBranch } from '@/hooks/useBranches';
import type { CreateBranchRequest } from '@/domain/entities/branch';

export default function CreateBranchForm() {
  const router = useRouter();
  const createBranchMutation = useCreateBranch();

  const [formData, setFormData] = useState<CreateBranchRequest>({
    branchName: '',
    phoneNumber: '',
    location: '',
    address: '',
    status: 'Active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createBranchMutation.mutateAsync(formData);
      router.push('/branches');
    } catch (err) {
        console.error('Error creating branch:', err);
      // Error is handled in the mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/branches" className="text-gray-600 hover:text-gray-900">Branches</Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-red-600 font-medium">Add Branch Details</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Create New Branch</h1>
          <div className="flex gap-3">
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700"
              disabled={createBranchMutation.isPending}
            >
              {createBranchMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Link href="/branches">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>

        {/* Branch Details Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-lg text-center">Branch Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="branchName">Branch Name *</Label>
                  <Input
                    id="branchName"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    placeholder="Enter branch name"
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Enter contact number"
                    className="mt-2"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address including building, street, city, pin code"
                  className="mt-2 min-h-[100px]"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}