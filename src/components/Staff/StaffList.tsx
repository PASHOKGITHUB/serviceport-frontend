'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { useStaff, useDeleteStaff } from '@/hooks/useStaff';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import type { Staff } from '@/domain/entities/staff';

export default function StaffList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  
  const { data: staff = [], isLoading } = useStaff();
  const deleteStaffMutation = useDeleteStaff();

  const filteredStaff = staff.filter((member) =>
    member.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.contactNumber.includes(searchQuery) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.specialization && member.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteClick = (staffMember: Staff) => {
    setStaffToDelete(staffMember);
    setDeleteDialogOpen(true);
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

  if (isLoading) {
    return <StaffListSkeleton />;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {filteredStaff.length} total staff members
          </p>
        </div>
        <Link href="/staff/create">
          <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
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
                placeholder="Search by name, contact, role, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden md:grid bg-red-600 text-white px-6 py-4 text-sm font-medium" style={{gridTemplateColumns: "1.5fr 1fr 1fr 1.2fr 1fr 1fr", gap: "1rem"}}>
          <div className="text-center">Name</div>
          <div className="text-center">Contact</div>
          <div className="text-center">Role</div>
          <div className="text-center">Specialization</div>
          <div className="text-center">Status</div>
          <div className="text-center">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {filteredStaff.map((member) => (
            <div key={member._id} className="p-4 sm:p-6">
              {/* Mobile Layout */}
              <div className="md:hidden space-y-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 break-words">{member.staffName}</div>
                    <div className="text-sm text-gray-500 break-all">{member.contactNumber}</div>
                    <div className="text-sm text-gray-500 capitalize">{member.role}</div>
                    {member.branch && (
                      <div className="text-sm text-gray-500 break-words">{member.branch.branchName}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={member.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Specialization: </span>
                    <span className="text-sm text-gray-900">{member.specialization || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/staff/edit/${member._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteClick(member)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Desktop Layout - Properly Centered */}
              <div className="hidden md:grid items-center hover:bg-gray-50 transition-colors" style={{gridTemplateColumns: "1.5fr 1fr 1fr 1.2fr 1fr 1fr", gap: "1rem"}}>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="font-medium text-gray-900 break-words">{member.staffName}</div>
                  {member.branch && (
                    <div className="text-sm text-gray-500 break-words">{member.branch.branchName}</div>
                  )}
                </div>
                <div className="text-gray-900 break-all flex justify-center items-center">{member.contactNumber}</div>
                <div className="flex justify-center items-center">
                  <Badge variant="outline" className="capitalize">
                    {member.role}
                  </Badge>
                </div>
                <div className="text-gray-900 break-words flex justify-center items-center text-center">
                  {member.specialization || 'N/A'}
                </div>
                <div className="flex justify-center items-center">
                  <Badge className={member.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <Link href={`/staff/edit/${member._id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteClick(member)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
            <Link href="/staff/create">
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
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