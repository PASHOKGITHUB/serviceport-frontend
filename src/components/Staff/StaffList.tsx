'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useStaff, useUpdateStaff, useDeleteStaff } from '@/hooks/useStaff';
import { useBranches } from '@/hooks/useBranches';
import type { StaffStatus } from '@/domain/entities/staff';

export default function StaffList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  
  const { data: staff = [], isLoading } = useStaff();
  const { data: branches = [] } = useBranches();
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();

  const handleStatusChange = async (staffId: string, newStatus: StaffStatus) => {
    try {
      await updateStaffMutation.mutateAsync({
        id: staffId,
        data: { action: newStatus }
      });
    } catch (err) {
        console.log('Error updating staff status:', err);
        
      // Error is handled in the mutation
    }
  };

  const handleDelete = async (staffId: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaffMutation.mutateAsync(staffId);
      } catch (err) {
        console.log('Error deleting staff member:', err);
        // Error is handled in the mutation
      }
    }
  };

  // Filter staff based on search and branch
  const filteredStaff = staff.filter(member => {
    const matchesSearch = !searchQuery || 
      member.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.contactNumber.includes(searchQuery);
    
    const matchesBranch = branchFilter === 'all' || member.branch._id === branchFilter;
    
    return matchesSearch && matchesBranch;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-gray-600">Manage staff members and their roles</p>
        </div>
        <Button asChild>
          <Link href="/staff/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <Input
                placeholder="Search by name or contact number..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch._id} value={branch._id}>
                    {branch.branchName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table Header */}
          <div className="hidden border-b bg-gray-50 px-6 py-3 md:grid md:grid-cols-6 md:gap-4">
            <div className="font-medium">Name</div>
            <div className="font-medium">Contact</div>
            <div className="font-medium">Role</div>
            <div className="font-medium">Branch</div>
            <div className="font-medium">Status</div>
            <div className="font-medium">Actions</div>
          </div>

          {/* Staff Rows */}
          <div className="divide-y">
            {filteredStaff.map((member) => (
              <div key={member._id} className="p-6 transition-colors hover:bg-gray-50">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{member.staffName}</div>
                      <div className="text-sm text-gray-600">{member.contactNumber}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(member._id)}
                        disabled={deleteStaffMutation.isPending}
                        className="text-red-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      member.role === 'Manager' 
                        ? 'border-transparent bg-purple-100 text-purple-800 hover:bg-purple-100/80'
                        : member.role === 'Technician'
                        ? 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/80'
                        : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}>
                      {member.role}
                    </div>
                    <div className="text-sm text-gray-600">
                      {member.branch.branchName} - {member.branch.location}
                    </div>
                  </div>
                  
                  <Select 
                    value={member.action}
                    onValueChange={(value: StaffStatus) => handleStatusChange(member._id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">
                        <span className="text-green-600">● Active</span>
                      </SelectItem>
                      <SelectItem value="Inactive">
                        <span className="text-red-600">● Inactive</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-6 md:gap-4 md:items-center">
                  <div className="font-medium">{member.staffName}</div>
                  <div className="text-gray-600">{member.contactNumber}</div>
                  <div>
                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      member.role === 'Manager' 
                        ? 'border-transparent bg-purple-100 text-purple-800 hover:bg-purple-100/80'
                        : member.role === 'Technician'
                        ? 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/80'
                        : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}>
                      {member.role}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{member.branch.branchName}</div>
                    <div className="text-sm text-gray-600">{member.branch.location}</div>
                  </div>
                  <div>
                    <Select 
                      value={member.action}
                      onValueChange={(value: StaffStatus) => handleStatusChange(member._id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">
                          <span className="text-green-600">● Active</span>
                        </SelectItem>
                        <SelectItem value="Inactive">
                          <span className="text-red-600">● Inactive</span>
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
                      onClick={() => handleDelete(member._id)}
                      disabled={deleteStaffMutation.isPending}
                      className="text-red-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredStaff.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-gray-600 mb-4">
                {searchQuery || branchFilter !== 'all'
                  ? 'No staff found matching your criteria.' 
                  : 'No staff members found.'
                }
              </div>
              <Button asChild>
                <Link href="/staff/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff Member
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}