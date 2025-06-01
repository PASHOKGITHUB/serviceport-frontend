'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search} from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useTechnicians } from '@/hooks/useStaff';
import { useBranches } from '@/hooks/useBranches';
import { useUpdateServiceAction, useAssignTechnician } from '@/hooks/useServices';
import { useServiceStore } from '@/store/serviceStore';
import { getStatusColor, formatDate } from '@/lib/utils';
import type { Service } from '@/domain/entities/service';

const statusOptions = [
  { value: 'all', label: 'All Statuses' }, // Changed from empty string
  { value: 'Received', label: 'Received' },
  { value: 'Assigned to Technician', label: 'Assigned to Technician' },
  { value: 'Under Inspection', label: 'Under Inspection' },
  { value: 'Waiting for Customer Approval', label: 'Waiting for Customer Approval' },
  { value: 'Approved', label: 'Approved' },
  { value: 'In Service', label: 'In Service' },
  { value: 'Finished', label: 'Finished' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' }
];

export default function ServicesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { filters, updateFilters } = useServiceStore();
  
  const { data: services = [], isLoading } = useServices(filters);
  const { data: technicians = [] } = useTechnicians();
  const { data: branches = [] } = useBranches();
  const updateActionMutation = useUpdateServiceAction();
  const assignTechnicianMutation = useAssignTechnician();

  const handleStatusChange = async (serviceId: string, newStatus: string) => {
    try {
      await updateActionMutation.mutateAsync({ id: serviceId, action: newStatus });
    } catch (err) {
        console.error('Error updating service status:', err);
      // Error is handled in the mutation
    }
  };

  const handleTechnicianChange = async (serviceId: string, technicianId: string) => {
    try {
      await assignTechnicianMutation.mutateAsync({ id: serviceId, technicianId });
    } catch (error) {
        console.error('Error assigning technician:', error);
      // Error is handled in the mutation
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
  };

  const handleStatusFilter = (status: string) => {
    // Convert 'all' back to empty string for the API
    updateFilters({ status: status === 'all' ? '' : status });
  };

  const handleBranchFilter = (branchId: string) => {
    // Convert 'all' back to empty string for the API
    updateFilters({ branch: branchId === 'all' ? '' : branchId });
  };

  if (isLoading) {
    return <ServicesListSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage all service requests and their status</p>
        </div>
        <Link href="/services/create">
          <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Service
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by ID, customer name, product, or serial number..."
                  className="pl-10 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" className="px-3">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Status Filter */}
            <Select 
              value={filters.status || 'all'} 
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-48 h-10">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Branch Filter */}
            <Select 
              value={filters.branch || 'all'} 
              onValueChange={handleBranchFilter}
            >
              <SelectTrigger className="w-full sm:w-48 h-10">
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

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table Header */}
          <div className="hidden md:grid bg-red-600 text-white px-6 py-3 grid-cols-7 gap-4 text-sm font-medium rounded-t-lg">
            <div>Service ID</div>
            <div>Customer</div>
            <div>Phone</div>
            <div>Product</div>
            <div>Technician</div>
            <div>Status</div>
            <div>Date</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {(services as Service[]).map((service: Service) => (
              <div key={service._id} className="p-4 sm:p-6">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 break-words font-mono text-sm">
                        {service.serviceId}
                      </div>
                      <div className="text-sm text-gray-900 break-words">{service.customerName}</div>
                      <div className="text-sm text-gray-500 break-all">{service.customerContactNumber}</div>
                      <div className="text-sm text-gray-500 break-words">{service.location}</div>
                    </div>
                    <Badge className={getStatusColor(service.action)}>
                      {service.action}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Product: </span>
                      <span className="text-sm text-gray-900 break-words">
                        {service.productDetails[0]?.productName || 'N/A'}
                      </span>
                      {service.productDetails[0]?.brand && (
                        <span className="text-sm text-gray-500"> - {service.productDetails[0].brand}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Date: </span>
                      <span className="text-sm text-gray-900">{formatDate(service.createdAt)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Select 
                      value={service.technician?._id || "unassigned"}
                      onValueChange={(value) => {
                        if (value !== "unassigned") {
                          handleTechnicianChange(service._id, value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Assign Technician" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {technicians.map((tech) => (
                          <SelectItem key={tech._id} value={tech._id}>
                            {tech.staffName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select 
                      value={service.action}
                      onValueChange={(value) => handleStatusChange(service._id, value)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Received">Received</SelectItem>
                        <SelectItem value="Assigned to Technician">Assigned</SelectItem>
                        <SelectItem value="Under Inspection">Inspection</SelectItem>
                        <SelectItem value="Waiting for Customer Approval">Waiting</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="In Service">In Service</SelectItem>
                        <SelectItem value="Finished">Finished</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid grid-cols-7 gap-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900 break-all font-mono text-sm">
                    {service.serviceId}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 break-words">{service.customerName}</div>
                    <div className="text-sm text-gray-500 break-words">{service.location}</div>
                  </div>
                  <div className="text-gray-900 break-all">{service.customerContactNumber}</div>
                  <div>
                    <div className="font-medium text-gray-900 break-words">
                      {service.productDetails[0]?.productName || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 break-words">
                      {service.productDetails[0]?.brand || ''}
                    </div>
                  </div>
                  <div>
                    <Select 
                      value={service.technician?._id || "unassigned"}
                      onValueChange={(value) => {
                        if (value !== "unassigned") {
                          handleTechnicianChange(service._id, value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Assign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {technicians.map((tech) => (
                          <SelectItem key={tech._id} value={tech._id}>
                            {tech.staffName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select 
                      value={service.action}
                      onValueChange={(value) => handleStatusChange(service._id, value)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Received">Received</SelectItem>
                        <SelectItem value="Assigned to Technician">Assigned</SelectItem>
                        <SelectItem value="Under Inspection">Inspection</SelectItem>
                        <SelectItem value="Waiting for Customer Approval">Waiting</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="In Service">In Service</SelectItem>
                        <SelectItem value="Finished">Finished</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Badge className={getStatusColor(service.action)}>
                      {service.action}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(service.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(services as Service[]).length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-500 mb-4">No services found matching your criteria.</div>
              <Link href="/services/create">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Service
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ServicesListSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-6 sm:h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-full sm:w-32" />
      </div>
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-4 sm:p-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}