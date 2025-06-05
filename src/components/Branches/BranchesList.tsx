'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Building2, ChevronDown, Loader2 } from 'lucide-react';
import { useBranches, useDeleteBranch } from '@/hooks/useBranches';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import type { Branch } from '@/domain/entities/branch';

export default function BranchList() {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [loadingBranchId, setLoadingBranchId] = useState<string | null>(null);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  
  const { data: branches = [], isLoading } = useBranches();
  const deleteBranchMutation = useDeleteBranch();

  const handleRowClick = (branchId: string) => {
    setLoadingBranchId(branchId);
    router.push(`/branches/edit/${branchId}`);
  };

  const handleAddBranch = () => {
    setIsAddingBranch(true);
    router.push('/branches/create');
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
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Branch Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {branches.length} total branches
          </p>
        </div>
        <Button 
          onClick={handleAddBranch}
          disabled={isAddingBranch}
          className="text-white w-full sm:w-auto font-medium"
          style={{ backgroundColor: '#925D00' }}
        >
          {isAddingBranch ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Branch
        </Button>
      </div>

      {/* Branch Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Desktop Table Header */}
        <div 
          className="hidden md:grid text-white px-6 py-4 text-sm font-medium" 
          style={{
            gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr", 
            gap: "1rem",
            backgroundColor: '#C5AA7E'
          }}
        >
          <div className="text-center">Branch Name</div>
          <div className="text-center">Phone Number</div>
          <div className="text-center">Location</div>
          <div className="text-center">Status</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {branches.map((branch) => (
            <div 
              key={branch._id} 
              className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleRowClick(branch._id)}
            >
              {/* Mobile Layout */}
              <div className="md:hidden space-y-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 break-words flex items-center gap-2">
                      {branch.branchName}
                      {loadingBranchId === branch._id && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 break-words">{branch.location}</div>
                    <div className="text-sm text-gray-500 break-all">{branch.phoneNumber}</div>
                    <div className="text-xs text-gray-400">ID: {branch._id.slice(-8)}</div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-1 text-sm">
                      <span 
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          branch.status === 'Active' ? 'text-black' : 'text-white'
                        }`}
                        style={{
                          background: branch.status === 'Active' 
                            ? 'transparent' 
                            : 'linear-gradient(180deg, #EC134A 0%, #65081F 97.55%)'
                        }}
                      >
                        {branch.status}
                      </span>
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div 
                className="hidden md:grid items-center"
                style={{gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr", gap: "1rem"}}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="font-medium text-gray-900 break-words flex items-center gap-2">
                    {branch.branchName}
                    {loadingBranchId === branch._id && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    )}
                  </div>
                  <div className="text-xs text-gray-400">ID: {branch._id.slice(-8)}</div>
                </div>
                <div className="text-gray-900 break-all flex justify-center items-center">{branch.phoneNumber}</div>
                <div className="text-gray-900 break-words flex justify-center items-center text-center">{branch.location}</div>
                <div className="flex justify-center items-center">
                  <div className="flex items-center gap-1">
                    <span 
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        branch.status === 'Active' ? 'text-black' : 'text-white'
                      }`}
                      style={{
                        background: branch.status === 'Active' 
                          ? 'transparent' 
                          : 'linear-gradient(180deg, #EC134A 0%, #65081F 97.55%)'
                      }}
                    >
                      {branch.status}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {branches.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first branch.
            </p>
            <Button 
              onClick={handleAddBranch}
              disabled={isAddingBranch}
              className="text-white"
              style={{ backgroundColor: '#925D00' }}
            >
              {isAddingBranch ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Branch
            </Button>
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