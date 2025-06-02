'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { 
  Package, 
  DollarSign,
  Plus,
  Search,
  TrendingUp,
  ArrowUp,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  IndianRupee
} from 'lucide-react';
import { useState } from 'react';
import { useServices } from '@/hooks/useServices';
import { useTechnicians } from '@/hooks/useStaff';
import { useUpdateServiceAction, useAssignTechnician } from '@/hooks/useServices';
import { getStatusColor} from '@/lib/utils';
import type { Service, Staff } from '@/domain/entities/service';

// Action hierarchy for validation
const ACTION_HIERARCHY = [
  'Received',
  'Assigned to Technician',
  'Under Inspection',
  'Waiting for Customer Approval',
  'Approved',
  'In Service',
  'Finished',
  'Delivered',
  'Completed',
  'Cancelled'
];

export default function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('month');
  const [servicesFilter, setServicesFilter] = useState('all');
  
  const { data: servicesResponse, isLoading: servicesLoading } = useServices();
  const { data: techniciansResponse, isLoading: techLoading } = useTechnicians();
  
  // Safely extract data from API responses
  const services: Service[] = servicesResponse?.data?.services || [];
  const technicians: Staff[] = techniciansResponse || [];

  const updateActionMutation = useUpdateServiceAction();
  const assignTechnicianMutation = useAssignTechnician();

  // Calculate statistics
  // const totalServices = services.length;
  const receivedServices = services.filter(service => service.action === 'Received').length;
  const pendingServices = services.filter(service => 
    ['Received', 'Under Inspection', 'Waiting for Customer Approval'].includes(service.action)
  ).length;
  const completedServices = services.filter(service => 
    service.action === 'Completed'
  ).length;

  // Revenue calculations
  const calculateRevenue = (period: 'today' | 'week' | 'month') => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let filterDate: Date;
    switch (period) {
      case 'today':
        filterDate = startOfToday;
        break;
      case 'week':
        filterDate = startOfWeek;
        break;
      case 'month':
        filterDate = startOfMonth;
        break;
    }

    const filteredServices = services.filter(service => {
      if (service.action !== 'Completed' || !service.serviceCost) return false;
      const serviceDate = service.deliveredDate ? new Date(service.deliveredDate) : new Date(service.updatedAt);
      return serviceDate >= filterDate;
    });

    return filteredServices.reduce((sum, service) => sum + (service.serviceCost || 0), 0);
  };

  const todayRevenue = calculateRevenue('today');
  const weeklyRevenue = calculateRevenue('week');
  const monthlyRevenue = calculateRevenue('month');

  // Get valid next actions based on current action
  const getValidNextActions = (currentAction: string) => {
    const currentIndex = ACTION_HIERARCHY.indexOf(currentAction);
    if (currentIndex === -1) return ACTION_HIERARCHY;
    
    const validActions = [currentAction];
    if (currentIndex < ACTION_HIERARCHY.length - 2) {
      validActions.push(ACTION_HIERARCHY[currentIndex + 1]);
    }
    if (currentAction !== 'Cancelled' && currentAction !== 'Completed') {
      validActions.push('Cancelled');
    }
    return validActions;
  };

  const handleActionChange = async (serviceId: string, newAction: string) => {
    try {
      await updateActionMutation.mutateAsync({ id: serviceId, action: newAction });
    } catch (err) {
      console.error('Error updating service action:', err);
    }
  };

  const handleTechnicianChange = async (serviceId: string, technicianId: string) => {
    try {
      await assignTechnicianMutation.mutateAsync({ id: serviceId, technicianId });
    } catch (error) {
      console.error('Error assigning technician:', error);
    }
  };

  // Filter services for the table
  const filteredServices = services.filter(service => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      service.serviceId.toLowerCase().includes(query) ||
      service.customerName.toLowerCase().includes(query) ||
      service.customerContactNumber.includes(query) ||
      service.productDetails.some(product => 
        product.productName.toLowerCase().includes(query)
      )
    );
  }).slice(0, 10); // Show only first 10 services

  // Get current date formatted
  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return now.toLocaleDateString('en-GB', options);
  };

  if (servicesLoading || techLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Dashboard</h1>
        </div>
        <Link href="/services/create">
          <Button className="bg-amber-700 hover:bg-amber-800 text-white w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Service
          </Button>
        </Link>
      </div>

      {/* Revenue and Stats Cards - Properly Sized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <Card className="shadow-md border border-gray-200 overflow-hidden h-fit">
          <CardHeader className="bg-white border-b border-gray-100 p-4">
            <CardTitle className="flex items-center justify-between text-black">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold">Revenue</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+8.4%</span>
                <ArrowUp className="h-3 w-3" />
                <span className="text-xs text-gray-500 ml-1">Last 26 Days</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-blue-600 text-base font-medium">Today:</span>
                <span className="text-2xl font-bold text-black">₹{todayRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 text-base font-medium">Weekly:</span>
                <span className="text-2xl font-bold text-black">₹{weeklyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 text-base font-medium">Monthly:</span>
                <span className="text-2xl font-bold text-black">₹{monthlyRevenue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Services Card */}
        <Card className="shadow-md border border-gray-200 overflow-hidden h-fit">
          <CardHeader className="bg-white border-b border-gray-100 p-4">
            <CardTitle className="flex items-center justify-between text-black">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold">Total Services</span>
              </div>
              <Select value={servicesFilter} onValueChange={setServicesFilter}>
                <SelectTrigger className="w-24 h-8 text-xs border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 bg-white">
            <div className="space-y-3">
              <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-xs text-gray-600 mb-1">Received</div>
                <div className="text-3xl font-bold text-black">{receivedServices}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center bg-red-50 rounded-lg p-2 border border-red-100">
                  <div className="text-xs text-red-600 font-medium mb-1">Pending</div>
                  <div className="text-lg font-bold text-red-600">{pendingServices}</div>
                </div>
                <div className="text-center bg-green-50 rounded-lg p-2 border border-green-100">
                  <div className="text-xs text-green-600 font-medium mb-1">Completed</div>
                  <div className="text-lg font-bold text-green-600">{completedServices}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search ID, Name, Number, Serial Number, Product Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-32 border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Services Table */}
      <Card className="shadow-md border border-gray-200 overflow-hidden">
        <CardHeader className="bg-gray-100 p-2 border-b border-gray-200">
          <CardTitle className="text-black text-sm font-medium">Services</CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {/* Desktop Table Header */}
          <div className="hidden md:grid bg-amber-600 text-white px-6 py-3 text-sm font-medium" style={{gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr 1.5fr 2fr 0.6fr", gap: "1rem"}}>
            <div className="text-center">Service ID</div>
            <div className="text-center">Customer</div>
            <div className="text-center">Phone</div>
            <div className="text-center">Product</div>
            <div className="text-center">Technician</div>
            <div className="text-center">Action</div>
            <div className="text-center">More</div>
          </div>

          {/* Date Header */}
          <div className="bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
            {getCurrentDate()}
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {filteredServices.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 mb-4">No services found</div>
                <Link href="/services/create">
                  <Button className="bg-amber-700 hover:bg-amber-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Service
                  </Button>
                </Link>
              </div>
            ) : (
              filteredServices.map((service) => (
                <div key={service._id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
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
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={getStatusColor(service.action)} variant="outline">
                          {service.action}
                        </Badge>
                      </div>
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
                      {service.serviceCost && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Cost: </span>
                          <span className="text-sm text-green-600 font-medium">
                            ₹{service.serviceCost}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:grid items-center" style={{gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr 1.5fr 2fr 0.6fr", gap: "1rem"}}>
                    <div className="font-medium text-gray-900 break-all font-mono text-sm flex justify-center">
                      {service.serviceId}
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="font-medium text-gray-900 break-words">{service.customerName}</div>
                      <div className="text-xs text-gray-500 break-words">{service.location}</div>
                    </div>
                    <div className="text-gray-900 break-all flex justify-center items-center text-sm">{service.customerContactNumber}</div>
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="font-medium text-gray-900 break-words text-sm">
                        {service.productDetails[0]?.productName || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 break-words">
                        {service.productDetails[0]?.brand || ''}
                      </div>
                      {service.serviceCost && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          ₹{service.serviceCost}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center items-center">
                      <Select 
                        value={service.technician?._id || "unassigned"}
                        onValueChange={(value) => {
                          if (value !== "unassigned") {
                            handleTechnicianChange(service._id, value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full h-8 text-xs border-gray-300">
                          <SelectValue placeholder="Assign" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {technicians.map((tech: Staff) => (
                            <SelectItem key={tech._id} value={tech._id}>
                              {tech.staffName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-center items-center">
                      <Select 
                        value={service.action}
                        onValueChange={(value) => handleActionChange(service._id, value)}
                      >
                        <SelectTrigger className="w-full h-8 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              service.action === 'Received' ? 'bg-blue-500' :
                              service.action === 'Assigned to Technician' ? 'bg-purple-500' :
                              service.action === 'Under Inspection' ? 'bg-yellow-500' :
                              service.action === 'Waiting for Customer Approval' ? 'bg-orange-500' :
                              service.action === 'Approved' ? 'bg-green-500' :
                              service.action === 'In Service' ? 'bg-indigo-500' :
                              service.action === 'Finished' ? 'bg-teal-500' :
                              service.action === 'Delivered' ? 'bg-cyan-500' :
                              service.action === 'Completed' ? 'bg-emerald-500' :
                              service.action === 'Cancelled' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                            <span className="truncate text-xs">{service.action}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {getValidNextActions(service.action).map((action) => (
                            <SelectItem key={action} value={action}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  action === 'Received' ? 'bg-blue-500' :
                                  action === 'Assigned to Technician' ? 'bg-purple-500' :
                                  action === 'Under Inspection' ? 'bg-yellow-500' :
                                  action === 'Waiting for Customer Approval' ? 'bg-orange-500' :
                                  action === 'Approved' ? 'bg-green-500' :
                                  action === 'In Service' ? 'bg-indigo-500' :
                                  action === 'Finished' ? 'bg-teal-500' :
                                  action === 'Delivered' ? 'bg-cyan-500' :
                                  action === 'Completed' ? 'bg-emerald-500' :
                                  action === 'Cancelled' ? 'bg-red-500' : 'bg-gray-500'
                                }`} />
                                <span className="text-xs">{action}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-center items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-gray-300">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-gray-200">
                          <DropdownMenuItem asChild>
                            <Link href={`/services/view/${service._id}`} className="flex items-center">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/services/edit/${service._id}`} className="flex items-center">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Service
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-2" />
                            Update Cost
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Service
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-gray-200 h-fit">
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-md" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-4">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}