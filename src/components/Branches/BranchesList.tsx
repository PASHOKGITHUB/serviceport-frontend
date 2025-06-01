'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useBranches, useUpdateBranch, useDeleteBranch } from '@/hooks/useBranches';
import { useDebounce } from '@/hooks/useDebounce';
import type { BranchStatus } from '@/domain/entities/branch';

export default function BranchesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  const { data: branches = [], isLoading } = useBranches();
  const updateBranchMutation = useUpdateBranch();
  const deleteBranchMutation = useDeleteBranch();

  const handleStatusChange = async (branchId: string, newStatus: BranchStatus) => {
    try {
      await updateBranchMutation.mutateAsync({
        id: branchId,
        data: { status: newStatus }
      });
    } catch (err) {
        console.error('Error updating branch status:', err);
      // Error is handled in the mutation
    }
  };

  const handleDelete = async (branchId: string) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await deleteBranchMutation.mutateAsync(branchId);
      } catch (err) {
        console.error('Error deleting branch:', err);
        // Error is handled in the mutation
      }
    }
  };

  // Filter branches based on search
  const filteredBranches = branches.filter(branch => 
    !debouncedSearch || 
    branch.branchName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    branch.location.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    branch.phoneNumber.includes(debouncedSearch)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-600">Manage branch locations and information</p>
        </div>
        <Link href="/branches/create">
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            New Branch
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by branch name, location, or phone number..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Branch Table */}
      <Card>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="bg-red-600 text-white px-6 py-3 grid grid-cols-6 gap-4 text-sm font-medium">
            <div>Branch Name</div>
            <div>Phone</div>
            <div>Location</div>
            <div>Staff Count</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y">
            {filteredBranches.map((branch) => (
              <div key={branch._id} className="px-6 py-4 grid grid-cols-6 gap-4 items-center hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{branch.branchName}</div>
                  <div className="text-sm text-gray-500">{branch.address}</div>
                </div>
                <div className="text-gray-900">{branch.phoneNumber}</div>
                <div className="text-gray-900">{branch.location}</div>
                <div className="text-gray-900">{branch.staffName?.length || 0} staff members</div>
                <div>
                  <Select 
                    value={branch.status}
                    onValueChange={(value: BranchStatus) => handleStatusChange(branch._id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">
                        <span className="text-green-600">Active</span>
                      </SelectItem>
                      <SelectItem value="Inactive">
                        <span className="text-red-600">Inactive</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(branch._id)}
                    disabled={deleteBranchMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredBranches.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-500 mb-4">
                {debouncedSearch 
                  ? 'No branches found matching your search.' 
                  : 'No branches found.'
                }
              </div>
              <Link href="/branches/create">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Branch
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}