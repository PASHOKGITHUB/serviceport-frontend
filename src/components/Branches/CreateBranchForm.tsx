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
        <span className="text-amber-700 font-medium">Add Branch Details</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black">Create New Branch</h1>
          <div className="flex gap-3">
            <Button 
              type="submit" 
              className="bg-amber-700 hover:bg-amber-800 text-white"
              disabled={createBranchMutation.isPending}
            >
              {createBranchMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Link href="/branches">
              <Button type="button" variant="outline" className="border-gray-300">Cancel</Button>
            </Link>
          </div>
        </div>

        {/* Branch Details Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-200 rounded-t-lg">
              <CardTitle className="text-lg text-center text-black">Branch Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="branchName" className="text-black">Branch Name *</Label>
                  <Input
                    id="branchName"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    placeholder="Enter branch name"
                    className="mt-2 border-gray-300"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactNumber" className="text-black">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Enter contact number"
                    className="mt-2 border-gray-300"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location" className="text-black">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                  className="mt-2 border-gray-300"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-black">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address including building, street, city, pin code"
                  className="mt-2 min-h-[100px] border-gray-300"
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