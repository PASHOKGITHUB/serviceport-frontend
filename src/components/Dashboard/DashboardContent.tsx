'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Search, 
  IndianRupee, 
  Wrench,
  TrendingUp,
  Users,
  Building2 
} from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useTechnicians } from '@/hooks/useStaff';
import { useUpdateServiceAction, useAssignTechnician } from '@/hooks/useServices';
import {  formatDate } from '@/lib/utils';
import type { ServiceFilters, Service } from '@/domain/entities/service';

export default function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ServiceFilters>({
    search: '',
    status: '',
  });

  const { data: services = [], isLoading: servicesLoading } = useServices(filters);
  const { data: technicians = [] } = useTechnicians();
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
    } catch (err) {
        console.error('Error assigning technician:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery }));
  };

  // Calculate statistics with proper typing
  const totalServices = (services as Service[]).length;
  const pendingServices = (services as Service[]).filter((s: Service) => 
    !['Completed', 'Cancelled', 'Delivered'].includes(s.action)
  ).length;
  const completedServices = (services as Service[]).filter((s: Service) => s.action === 'Completed').length;

  if (servicesLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Welcome back! Here&apos;s your service overview.</p>
        </div>
        <Link href="/services/create">
          <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Service
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Revenue Card */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">₹54,550</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.4% from last month
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Services */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalServices}</p>
                <p className="text-xs text-blue-600">All time</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Wrench className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Services */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{pendingServices}</p>
                <p className="text-xs text-orange-600">Need attention</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Services */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{completedServices}</p>
                <p className="text-xs text-green-600">This month</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services by ID, customer name, or product..."
                className="pl-10 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Services */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl font-semibold">Recent Services</CardTitle>
            <Link href="/services">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table Header */}
          <div className="hidden md:grid bg-red-600 text-white px-6 py-3 grid-cols-6 gap-4 text-sm font-medium">
            <div>Service ID</div>
            <div>Customer</div>
            <div>Product</div>
            <div>Technician</div>
            <div>Status</div>
            <div>Date</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {(services as Service[]).slice(0, 5).map((service: Service) => (
              <div key={service._id} className="p-4 sm:p-6">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 break-words">{service.serviceId}</div>
                      <div className="text-sm text-gray-500 break-words">{service.customerName}</div>
                      <div className="text-sm text-gray-500 break-all">{service.customerContactNumber}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Product: </span>
                      <span className="text-sm text-gray-900">
                        {service.productDetails[0]?.productName || 'N/A'}
                      </span>
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

{/* Technician Assignment - Mobile Layout */}
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
                <div className="hidden md:grid grid-cols-6 gap-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900 break-all font-mono text-sm">
                    {service.serviceId}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 break-words">{service.customerName}</div>
                    <div className="text-sm text-gray-500 break-all">{service.customerContactNumber}</div>
                  </div>
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
                      value={service.technician?._id || ""}
                      onValueChange={(value) => handleTechnicianChange(service._id, value)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Assign" />
                      </SelectTrigger>
                      <SelectContent>
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
                  <div className="text-sm text-gray-500">
                    {formatDate(service.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(services as Service[]).length === 0 && (
            <div className="px-6 py-12 text-center">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first service.</p>
              <Link href="/services/create">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Service
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mb-2" />
          <Skeleton className="h-4 w-48 sm:w-64" />
        </div>
        <Skeleton className="h-10 w-full sm:w-32" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 sm:h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search skeleton */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-4 sm:p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}