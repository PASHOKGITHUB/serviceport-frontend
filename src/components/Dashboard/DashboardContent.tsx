'use client';

import { Card, CardContent} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { 
  Package, 
  Plus,
  Search,
  TrendingUp,
  ArrowUp,
  IndianRupee,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useServices } from '@/hooks/useServices';
import { useTechnicians } from '@/hooks/useStaff';
import { useUpdateServiceAction, useAssignTechnician } from '@/hooks/useServices';
import { getStatusColor} from '@/lib/utils';
import type { Service, Staff } from '@/domain/entities/service';
import { useRouter } from 'next/navigation';

const ACTION_OPTIONS = [
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

interface DateGroupedServices {
  date: string;
  services: Service[];
}

export default function DashboardContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('Last Month');
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [newServiceLoading, setNewServiceLoading] = useState(false);
  
  const { data: servicesResponse, isLoading: servicesLoading } = useServices();
  const { data: techniciansResponse, isLoading: techLoading } = useTechnicians();
  
  // Safely extract data from API responses
  const services: Service[] = servicesResponse?.data?.services || [];
  const technicians: Staff[] = techniciansResponse || [];

  const updateActionMutation = useUpdateServiceAction();
  const assignTechnicianMutation = useAssignTechnician();

  const handleNewServiceClick = () => {
    setNewServiceLoading(true);
    router.push('/services/create');
  };

  const handleActionChange = async (e: React.MouseEvent, serviceId: string, newAction: string) => {
    e.stopPropagation();
    try {
      setLoadingActions(prev => new Set(prev).add(serviceId));
      await updateActionMutation.mutateAsync({ id: serviceId, action: newAction });
      
      // Close the dropdown after successful update
      setOpenDropdowns(prev => {
        const newSet = new Set(prev);
        newSet.delete(`action-${serviceId}`);
        return newSet;
      });
    } catch (err) {
      console.error('Error updating service action:', err);
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(serviceId);
        return newSet;
      });
    }
  };

  const handleTechnicianChange = async (e: React.MouseEvent, serviceId: string, technicianId: string) => {
    e.stopPropagation();
    try {
      await assignTechnicianMutation.mutateAsync({ id: serviceId, technicianId });
      
      // Close the dropdown after successful update
      setOpenDropdowns(prev => {
        const newSet = new Set(prev);
        newSet.delete(`technician-${serviceId}`);
        return newSet;
      });
    } catch (error) {
      console.error('Error assigning technician:', error);
    }
  };

  // Filter services based on time filter
  const getFilteredServicesByTime = (timeFilter: string) => {
    const now = new Date();
    let filterDate: Date;

    switch (timeFilter) {
      case 'Today':
        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'Last Week':
        filterDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case 'Last Month':
        filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return services.filter(service => {
      const serviceDate = new Date(service.createdAt);
      return serviceDate >= filterDate;
    });
  };

  // Get filtered services based on selected time filter
  const filteredServicesByTime = getFilteredServicesByTime(timeFilter);

  // Calculate statistics based on filtered services
  const receivedServices = filteredServicesByTime.length; // Total services received within the period
  
  // Pending: all services except Completed and Cancelled
  const pendingServices = filteredServicesByTime.filter(service => 
    !['Completed', 'Cancelled'].includes(service.action)
  ).length;
  
  const completedServices = filteredServicesByTime.filter(service => 
    service.action === 'Completed'
  ).length;

  // Fixed Revenue calculations
  const calculateRevenue = (period: 'today' | 'week' | 'month') => {
    const now = new Date();
    
    return services.filter(service => {
      // Only include services with cost
      if (!service.serviceCost) return false;
      
      // Use the most appropriate date for revenue calculation
      // Priority: deliveredDate > updatedAt > createdAt
      let revenueDate: Date;
      if (service.deliveredDate) {
        revenueDate = new Date(service.deliveredDate);
      } else if (service.action === 'Completed') {
        revenueDate = new Date(service.updatedAt);
      } else {
        // For non-completed services, don't count as revenue yet
        return false;
      }

      // Check if the revenue falls within the specified period
      switch (period) {
        case 'today':
          const today = new Date();
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          return revenueDate >= todayStart && revenueDate < todayEnd;
          
        case 'week':
          const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          return revenueDate >= weekAgo;
          
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return revenueDate >= monthStart;
          
        default:
          return false;
      }
    }).reduce((sum, service) => sum + (service.serviceCost || 0), 0);
  };

  const todayRevenue = calculateRevenue('today');
  const weeklyRevenue = calculateRevenue('week');
  const monthlyRevenue = calculateRevenue('month');

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

  // Group services by date
  const servicesByDate: DateGroupedServices[] = useMemo(() => {
    const grouped = filteredServices.reduce((acc: Record<string, Service[]>, service: Service) => {
      const date = new Date(service.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(service);
      return acc;
    }, {});

    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(grouped).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedDates.map(date => ({
      date,
      services: grouped[date]
    }));
  }, [filteredServices]);

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
        <Button 
          onClick={handleNewServiceClick}
          disabled={newServiceLoading}
          className="text-white w-full sm:w-auto font-medium"
          style={{ backgroundColor: '#925D00' }}
        >
          {newServiceLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New Service
            </>
          )}
        </Button>
      </div>

      {/* Revenue and Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-pink-700" />
                </div>
                <span className="text-xl font-bold text-black">Revenue</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <span className="font-medium">+8.4%</span>
                <TrendingUp className="h-3 w-3" />
                <ArrowUp className="h-3 w-3" />
                <span className="text-xs text-gray-500 ml-1">Last 26 Days</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Today:</span>
                <span className="text-2xl font-bold text-black">₹{todayRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Weekly:</span>
                <span className="text-2xl font-bold text-black">₹{weeklyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Monthly:</span>
                <span className="text-2xl font-bold text-black">₹{monthlyRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Services Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center">
                  <Package className="h-6 w-6 text-pink-700" />
                </div>
                <span className="text-xl font-bold text-black">Total Services</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="text-sm font-medium px-4 py-2 h-8 rounded-full border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    {timeFilter}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                  <DropdownMenuItem onClick={() => setTimeFilter('Today')}>Today</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeFilter('Last Week')}>Last Week</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeFilter('Last Month')}>Last Month</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-3">
              <div className="text-center bg-gray-100 rounded-2xl p-4">
                <div className="text-sm text-gray-600 mb-2 font-medium">Received</div>
                <div className="text-3xl font-bold text-black">{receivedServices}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center bg-gray-100 rounded-2xl p-3">
                  <div className="text-sm text-red-600 font-medium mb-2">Pending</div>
                  <div className="text-2xl font-bold text-red-600">{pendingServices}</div>
                </div>
                <div className="text-center bg-gray-100 rounded-2xl p-3">
                  <div className="text-sm text-green-600 font-medium mb-2">Completed</div>
                  <div className="text-2xl font-bold text-green-600">{completedServices}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search ID, Name, Number, Serial Number, Product Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300 bg-transparent"
          />
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-black">Service</h3>
        </div>

        {/* Desktop Table Header */}
        <div 
          className="hidden md:grid text-white px-6 py-4 text-sm font-medium" 
          style={{
            gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr 1fr 1fr 1fr", 
            gap: "1rem",
            backgroundColor: '#C5AA7E'
          }}
        >
          <div className="text-center">Service ID</div>
          <div className="text-center">Customer Name</div>
          <div className="text-center">Phone</div>
          <div className="text-center">Product Name</div>
          <div className="text-center">Technician</div>
          <div className="text-center">Action</div>
          <div className="text-center">Amount</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredServices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-4 font-medium">No services found</div>
              <Button 
                onClick={handleNewServiceClick}
                disabled={newServiceLoading}
                className="text-white font-medium"
                style={{ backgroundColor: '#925D00' }}
              >
                {newServiceLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Service
                  </>
                )}
              </Button>
            </div>
          ) : (
            servicesByDate.map(({ date, services: dateServices }: DateGroupedServices) => (
              <div key={date}>
                {/* Date Header */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                </div>

                {/* Services for this date */}
                {dateServices.map((service: Service) => (
                  <Link key={service._id} href={`/services/view/${service._id}`}>
                    <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      {/* Mobile Layout */}
                      <div className="md:hidden space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 break-words font-mono text-sm">
                              {service.serviceId}
                            </div>
                            <div className="text-sm text-gray-900 break-words font-medium">{service.customerName}</div>
                            <div className="text-sm text-gray-500 break-all font-medium">{service.customerContactNumber}</div>
                            <div className="text-sm text-gray-500 break-words font-medium">{service.location}</div>
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
                            <span className="text-sm text-gray-900 break-words font-medium">
                              {service.productDetails[0]?.productName || 'N/A'}
                            </span>
                            {service.productDetails[0]?.brand && (
                              <span className="text-sm text-gray-500 font-medium"> - {service.productDetails[0].brand}</span>
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Technician: </span>
                            <span className="text-sm text-gray-900 break-words font-medium">
                              {service.technician?.staffName || 'Unassigned'}
                            </span>
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
                      <div 
                        className="hidden md:grid items-center" 
                        style={{gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr 1fr 1fr 1fr", gap: "1rem"}}
                      >
                        <div className="font-medium text-gray-900 break-all font-mono text-sm flex justify-center">
                          {service.serviceId}
                        </div>
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="font-medium text-gray-900 break-words">{service.customerName}</div>
                          <div className="text-xs text-gray-500 break-words font-medium">{service.location}</div>
                        </div>
                        <div className="text-gray-900 break-all flex justify-center items-center text-sm font-medium">
                          {service.customerContactNumber}
                        </div>
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="font-medium text-gray-900 break-words text-sm">
                            {service.productDetails[0]?.productName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 break-words font-medium">
                            {service.productDetails[0]?.brand || ''}
                          </div>
                        </div>
                        <div className="flex justify-center items-center">
                          <DropdownMenu 
                            open={openDropdowns.has(`technician-${service._id}`)}
                            onOpenChange={(isOpen) => {
                              setOpenDropdowns(prev => {
                                const newSet = new Set(prev);
                                if (isOpen) {
                                  newSet.add(`technician-${service._id}`);
                                } else {
                                  newSet.delete(`technician-${service._id}`);
                                }
                                return newSet;
                              });
                            }}
                          >
                            <DropdownMenuTrigger asChild>
                              <button 
                                className="w-full px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-between font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="truncate">
                                  {service.technician?.staffName || 'Assign Technician'}
                                </span>
                                <ChevronDown className="h-3 w-3 flex-shrink-0" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white w-48">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="font-medium"
                              >
                                Unassigned
                              </DropdownMenuItem>
                              {technicians.map((tech: Staff) => (
                                <DropdownMenuItem 
                                  key={tech._id}
                                  onClick={(e) => handleTechnicianChange(e, service._id, tech._id)}
                                  className="font-medium"
                                >
                                  {tech.staffName}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex justify-center items-center">
                          <DropdownMenu 
                            open={openDropdowns.has(`action-${service._id}`)}
                            onOpenChange={(isOpen) => {
                              setOpenDropdowns(prev => {
                                const newSet = new Set(prev);
                                if (isOpen) {
                                  newSet.add(`action-${service._id}`);
                                } else {
                                  newSet.delete(`action-${service._id}`);
                                }
                                return newSet;
                              });
                            }}
                          >
                            <DropdownMenuTrigger asChild>
                              <button 
                                className="w-full px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-between max-w-32 font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="truncate text-left">
                                  {service.action.length > 12 ? `${service.action.substring(0, 12)}...` : service.action}
                                </span>
                                {loadingActions.has(service._id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 flex-shrink-0" />
                                )}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white w-52">
                              {ACTION_OPTIONS.map((action: string) => (
                                <DropdownMenuItem 
                                  key={action}
                                  onClick={(e) => handleActionChange(e, service._id, action)}
                                  className={service.action === action ? 'bg-gray-100 font-medium' : 'font-medium'}
                                >
                                  {action}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex justify-center items-center">
                          <div className="px-3 py-1 text-xs border border-gray-300 rounded flex items-center gap-1 font-medium">
                            <IndianRupee className="h-3 w-3" />
                            {service.serviceCost ? `${service.serviceCost}` : 'Amount'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
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