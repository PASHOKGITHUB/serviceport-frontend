'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
import { useBranches, useDeleteBranch } from '@/hooks/useBranches';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import type { Branch } from '@/domain/entities/branch';

export default function BranchList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  
  const { data: branches = [], isLoading } = useBranches();
  const deleteBranchMutation = useDeleteBranch();

  const filteredBranches = branches.filter((branch) =>
    branch.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.phoneNumber.includes(searchQuery)
  );

  const handleDeleteClick = (branch: Branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (branchToDelete) {
      try {
        await deleteBranchMutation.mutateAsync(branchToDelete._id);
        setDeleteDialogOpen(false);
        setBranchToDelete(null);
      } catch (error) {
        console.error('Error deleting branch:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setBranchToDelete(null);
  };

  if (isLoading) {
    return <BranchListSkeleton />;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {filteredBranches.length} total branches
          </p>
        </div>
        <Link href="/branches/create">
          <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        </Link>
      </div>

      {/* Search Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          {/* Search Bar - Left Side */}
          <div className="flex-1 lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by branch name, location, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Branch Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden md:grid bg-red-600 text-white px-6 py-4 text-sm font-medium" style={{gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", gap: "1rem"}}>
          <div className="text-center">Branch Name</div>
          <div className="text-center">Location</div>
          <div className="text-center">Phone Number</div>
          <div className="text-center">Status</div>
          <div className="text-center">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {filteredBranches.map((branch) => (
            <div key={branch._id} className="p-4 sm:p-6">
              {/* Mobile Layout */}
              <div className="md:hidden space-y-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 break-words">{branch.branchName}</div>
                    <div className="text-sm text-gray-500 break-words">{branch.location}</div>
                    <div className="text-sm text-gray-500 break-all">{branch.phoneNumber}</div>
                    <div className="text-xs text-gray-400">ID: {branch._id.slice(-8)}</div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={branch.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                      {branch.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/branches/edit/${branch._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteClick(branch)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Desktop Layout - Properly Centered */}
              <div className="hidden md:grid items-center hover:bg-gray-50 transition-colors" style={{gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", gap: "1rem"}}>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="font-medium text-gray-900 break-words">{branch.branchName}</div>
                  <div className="text-xs text-gray-400">ID: {branch._id.slice(-8)}</div>
                </div>
                <div className="text-gray-900 break-words flex justify-center items-center text-center">{branch.location}</div>
                <div className="text-gray-900 break-all flex justify-center items-center">{branch.phoneNumber}</div>
                <div className="flex justify-center items-center">
                  <Badge className={branch.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                    {branch.status}
                  </Badge>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <Link href={`/branches/edit/${branch._id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteClick(branch)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBranches.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'No branches match your search criteria.' : 'Get started by adding your first branch.'}
            </p>
            <Link href="/branches/create">
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Branch"
        description={`Are you sure you want to delete ${branchToDelete?.branchName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleteBranchMutation.isPending}
      />
    </div>
  );
}

function BranchListSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <Skeleton className="h-16 w-full" />
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}