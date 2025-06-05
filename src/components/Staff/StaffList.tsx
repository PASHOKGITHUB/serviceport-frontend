'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Plus, Search, Users, ChevronDown, Loader2 } from 'lucide-react';
import { useStaff, useDeleteStaff, useUpdateStaff } from '@/hooks/useStaff';
import { useBranches } from '@/hooks/useBranches';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import { toast } from 'sonner';
import type { Staff } from '@/domain/entities/staff';

export default function StaffList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loadingStaffId, setLoadingStaffId] = useState<string | null>(null);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [updatingToStatus, setUpdatingToStatus] = useState<'Active' | 'Inactive' | null>(null);
  
  const { data: staff = [], isLoading: staffLoading } = useStaff();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const deleteStaffMutation = useDeleteStaff();
  const updateStaffMutation = useUpdateStaff();

  // Create filter options dynamically from branches
  const filterOptions = ['All', ...branches.map(branch => branch.branchName)];

  // Filter staff by search and active filter
  const filteredStaff = staff.filter((member) => {
    const matchesSearch = member.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.contactNumber.includes(searchQuery) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'All' || 
      (member.branch && member.branch.branchName === activeFilter);
    
    return matchesSearch && matchesFilter;
  });

  const handleRowClick = (staffId: string) => {
    setLoadingStaffId(staffId);
    router.push(`/staff/${staffId}`);
  };

  const handleAddStaff = () => {
    setIsAddingStaff(true);
    router.push('/staff/create');
  };

const handleStatusUpdate = async (staffMember: Staff, newStatus: 'Active' | 'Inactive', event: React.MouseEvent) => {
  // Prevent the row click event from triggering
  event.stopPropagation();
  
  if (staffMember.action === newStatus) return;
  
  setUpdatingStatusId(staffMember._id);
  setUpdatingToStatus(newStatus);
  
  try {
    // Create update data with current staff info
    const updateData = {
      staffName: staffMember.staffName,
      contactNumber: staffMember.contactNumber,
      role: staffMember.role,
      branch: typeof staffMember.branch === 'object' ? staffMember.branch._id : staffMember.branch,
      address: staffMember.address || '',
      action: newStatus
    };

    await updateStaffMutation.mutateAsync({
      id: staffMember._id,
      data: updateData
    });
    
  } catch (error) {
    console.error('Error updating staff status:', error);
    toast.error('Failed to update staff status');
  } finally {
    setUpdatingStatusId(null);
    setUpdatingToStatus(null);
  }
};

  const handleConfirmDelete = async () => {
    if (staffToDelete) {
      try {
        await deleteStaffMutation.mutateAsync(staffToDelete._id);
        setDeleteDialogOpen(false);
        setStaffToDelete(null);
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setStaffToDelete(null);
  };

  if (staffLoading || branchesLoading) {
    return <StaffListSkeleton />;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Staff Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {filteredStaff.length} total staff members
          </p>
        </div>
        <Button 
          onClick={handleAddStaff}
          disabled={isAddingStaff}
          className="text-white w-full sm:w-auto font-medium"
          style={{ backgroundColor: '#925D00' }}
        >
          {isAddingStaff ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Staff
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-6">
        {filterOptions.map((option) => {
          const staffCount = option === 'All' 
            ? staff.length 
            : staff.filter(member => member.branch?.branchName === option).length;
          
          return (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-2 py-2 text-sm font-medium transition-all relative ${
                activeFilter === option
                  ? 'text-[#C5AA7E]'
                  : 'text-gray-600 hover:text-[#C5AA7E]'
              }`}
            >
              {option}({staffCount})
              {activeFilter === option && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: '#C5AA7E' }}
                ></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Section */}
      <div className="flex items-center">
        <div className="flex-1 lg:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, contact, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Desktop Table Header */}
        <div 
          className="hidden md:grid text-white px-6 py-4 text-sm font-medium" 
          style={{
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", 
            gap: "1rem",
            backgroundColor: '#C5AA7E'
          }}
        >
          <div className="text-center">Name</div>
          <div className="text-center">Phone</div>
          <div className="text-center">Role</div>
          <div className="text-center">Branch</div>
          <div className="text-center">Action</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredStaff.map((member) => (
            <div 
              key={member._id} 
              className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleRowClick(member._id)}
            >
              {/* Mobile Layout */}
              <div className="md:hidden space-y-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 break-words flex items-center gap-2">
                      {member.staffName}
                      {loadingStaffId === member._id && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 break-all">{member.contactNumber}</div>
                    <div className="text-sm text-gray-500 capitalize">{member.role}</div>
                    {member.branch && (
                      <div className="text-sm text-gray-500 break-words">{member.branch.branchName}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Popover>
                    <PopoverTrigger asChild>
                      <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="px-2 py-1 rounded text-sm font-medium text-black">
                          {member.action}
                        </span>
                        {updatingStatusId === member._id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-32 p-1 bg-white border border-gray-200 shadow-lg" align="center">
                      <div className="flex flex-col">
                        <button
                          onClick={(e) => handleStatusUpdate(member, 'Active', e)}
                          className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded ${
                            member.action === 'Active' ? 'bg-gray-50 font-medium' : ''
                          }`}
                          disabled={updatingStatusId === member._id}
                        >
                          {updatingStatusId === member._id && updatingToStatus === 'Active' ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Active</span>
                            </div>
                          ) : (
                            'Active'
                          )}
                        </button>
                        <button
                          onClick={(e) => handleStatusUpdate(member, 'Inactive', e)}
                          className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded ${
                            member.action === 'Inactive' ? 'bg-gray-50 font-medium' : ''
                          }`}
                          disabled={updatingStatusId === member._id}
                        >
                          {updatingStatusId === member._id && updatingToStatus === 'Inactive' ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Inactive</span>
                            </div>
                          ) : (
                            'Inactive'
                          )}
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div 
                className="hidden md:grid items-center"
                style={{gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: "1rem"}}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="font-medium text-gray-900 break-words flex items-center gap-2">
                    {member.staffName}
                    {loadingStaffId === member._id && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    )}
                  </div>
                </div>
                <div className="text-gray-900 break-all flex justify-center items-center">{member.contactNumber}</div>
                <div className="flex justify-center items-center">
                  <span className="text-gray-900">{member.role}</span>
                </div>
                <div className="flex justify-center items-center">
                  <span className="text-gray-900">{member.branch?.branchName || 'N/A'}</span>
                </div>
                <div className="flex justify-center items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="px-2 py-1 rounded text-sm font-medium text-black">
                          {member.action}
                        </span>
                        {updatingStatusId === member._id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-32 p-1 bg-white border border-gray-200 shadow-lg" align="center">
                      <div className="flex flex-col">
                        <button
                          onClick={(e) => handleStatusUpdate(member, 'Active', e)}
                          className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded ${
                            member.action === 'Active' ? 'bg-gray-50 font-medium' : ''
                          }`}
                          disabled={updatingStatusId === member._id}
                        >
                          {updatingStatusId === member._id && updatingToStatus === 'Active' ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Active</span>
                            </div>
                          ) : (
                            'Active'
                          )}
                        </button>
                        <button
                          onClick={(e) => handleStatusUpdate(member, 'Inactive', e)}
                          className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded ${
                            member.action === 'Inactive' ? 'bg-gray-50 font-medium' : ''
                          }`}
                          disabled={updatingStatusId === member._id}
                        >
                          {updatingStatusId === member._id && updatingToStatus === 'Inactive' ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Inactive</span>
                            </div>
                          ) : (
                            'Inactive'
                          )}
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStaff.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'No staff members match your search criteria.' : 'Get started by adding your first staff member.'}
            </p>
            <Button 
              onClick={handleAddStaff}
              disabled={isAddingStaff}
              className="text-white"
              style={{ backgroundColor: '#925D00' }}
            >
              {isAddingStaff ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Staff Member
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${staffToDelete?.staffName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleteStaffMutation.isPending}
      />
    </div>
  );
}

function StaffListSkeleton() {
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