'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Building2, ChevronDown, Loader2 } from 'lucide-react';
import { useBranches, useDeleteBranch, useUpdateBranchStatus } from '@/hooks/useBranches';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import type { Branch, BranchStatus } from '@/domain/entities/branch';

export default function BranchList() {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [loadingBranchId, setLoadingBranchId] = useState<string | null>(null);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [statusUpdatingBranchId, setStatusUpdatingBranchId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: branches = [], isLoading } = useBranches();
  const deleteBranchMutation = useDeleteBranch();
  const updateBranchStatusMutation = useUpdateBranchStatus();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRowClick = (branchId: string) => {
    setLoadingBranchId(branchId);
    router.push(`/branches/view/${branchId}`);
  };

  const handleAddBranch = () => {
    setIsAddingBranch(true);
    router.push('/branches/create');
  };

  const handleStatusToggle = (e: React.MouseEvent, branchId: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === branchId ? null : branchId);
  };

  const handleStatusUpdate = async (branchId: string, newStatus: BranchStatus) => {
    setStatusUpdatingBranchId(branchId);
    setOpenDropdownId(null);
    
    try {
      await updateBranchStatusMutation.mutateAsync({
        id: branchId,
        data: { status: newStatus }
      });
    } catch (error) {
      console.error('Error updating branch status:', error);
    } finally {
      setStatusUpdatingBranchId(null);
    }
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
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-1 text-sm relative">
                      <button
                        onClick={(e) => handleStatusToggle(e, branch._id)}
                        disabled={statusUpdatingBranchId === branch._id}
                        className="px-3 py-2 rounded border border-gray-300 text-black font-medium transition-all duration-200 hover:bg-gray-50 flex items-center gap-2 bg-white"
                      >
                        {statusUpdatingBranchId === branch._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            {branch.status}
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      
                      {/* Dropdown */}
                      {openDropdownId === branch._id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute top-full right-0 mt-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10"
                        >
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(branch._id, 'Active');
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                            >
                              Active
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(branch._id, 'Inactive');
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                            >
                              Inactive
                            </button>
                          </div>
                        </div>
                      )}
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
                </div>
                <div className="text-gray-900 break-all flex justify-center items-center">{branch.phoneNumber}</div>
                <div className="text-gray-900 break-words flex justify-center items-center text-center">{branch.location}</div>
                <div className="flex justify-center items-center relative">
                  <button
                    onClick={(e) => handleStatusToggle(e, branch._id)}
                    disabled={statusUpdatingBranchId === branch._id}
                    className="px-3 py-2 rounded border border-gray-300 text-black font-medium transition-all duration-200 hover:bg-gray-50 flex items-center gap-2 bg-white"
                  >
                    {statusUpdatingBranchId === branch._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {branch.status}
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  
                  {/* Dropdown */}
                  {openDropdownId === branch._id && (
                    <div 
                      ref={dropdownRef}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10"
                    >
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(branch._id, 'Active');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                        >
                          Active
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(branch._id, 'Inactive');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                        >
                          Inactive
                        </button>
                      </div>
                    </div>
                  )}
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