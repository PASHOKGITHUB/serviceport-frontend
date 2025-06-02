'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  IndianRupee, 
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useBranches } from '@/hooks/useBranches';
import { useUpdateServiceCost, useUpdateServiceAction, useAssignTechnician } from '@/hooks/useServices';
import { useTechnicians } from '@/hooks/useStaff';

// Types
interface Service {
  _id: string;
  serviceId: string;
  customerName: string;
  customerContactNumber: string;
  action: string;
  address: string;
  location: string;
  productDetails: Array<{
    productName: string;
    serialNumber: string;
    brand: string;
    type: string;
    productIssue: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  serviceCost?: number;
  technician?: {
    _id: string;
    staffName: string;
    contactNumber: string;
    role: string;
  };
}

interface Branch {
  _id: string;
  branchName: string;
  location: string;
}

interface Technician {
  _id: string;
  staffName: string;
  contactNumber: string;
  role: string;
}

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

export default function ServicesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [loadingServiceId, setLoadingServiceId] = useState<string | null>(null);
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [newCost, setNewCost] = useState('');
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  
  const { data: servicesResponse, isLoading } = useServices();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: techniciansResponse } = useTechnicians();
  const updateCostMutation = useUpdateServiceCost();
  const updateActionMutation = useUpdateServiceAction();
  const assignTechnicianMutation = useAssignTechnician();

  const allServices = useMemo((): Service[] => 
    servicesResponse?.data?.services || [], 
    [servicesResponse?.data?.services]
  );

  const technicians = useMemo((): Technician[] => 
    techniciansResponse || [], 
    [techniciansResponse]
  );

  const displayServices = searchQuery ? 
    allServices.filter((service: Service) => 
      service.serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.customerContactNumber.includes(searchQuery)
    ) : allServices;

  // Get unique actions for filter tabs
  const filterOptions = useMemo(() => {
    const actions = [...new Set(allServices.map(service => service.action).filter(Boolean))];
    return ['All', ...actions];
  }, [allServices]);

  // Filter services by active filter and selected branch
  const filteredServices = useMemo(() => {
    return displayServices.filter((service: Service) => {
      const matchesAction = activeFilter === 'All' || service.action === activeFilter;
      // Note: Services don't have branchId in the provided data structure
      // If you need branch filtering, you'll need to add branchId to service data
      const matchesBranch = selectedBranch === 'All Branches'; // Always true for now
      return matchesAction && matchesBranch;
    });
  }, [displayServices, activeFilter, selectedBranch]);

  // Group services by date
  const servicesByDate = useMemo(() => {
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

  const handleRowClick = (serviceId: string) => {
    setLoadingServiceId(serviceId);
  };

  const handleActionChange = async (serviceId: string, newAction: string) => {
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

  const handleTechnicianChange = async (serviceId: string, technicianId: string) => {
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

  const openCostDialog = (service: Service) => {
    setSelectedService(service);
    setNewCost(service.serviceCost?.toString() || '');
    setCostDialogOpen(true);
  };

  const handleCostUpdate = async () => {
    if (selectedService && newCost) {
      try {
        await updateCostMutation.mutateAsync({ 
          id: selectedService._id, 
          serviceCost: parseFloat(newCost) 
        });
        setCostDialogOpen(false);
        setSelectedService(null);
        setNewCost('');
      } catch (error) {
        console.error('Error updating service cost:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      case 'received':
        return 'text-blue-600';
      case 'assigned to technician':
        return 'text-purple-600';
      case 'under inspection':
        return 'text-yellow-600';
      case 'approved':
        return 'text-green-600';
      case 'in service':
        return 'text-indigo-600';
      case 'finished':
        return 'text-teal-600';
      case 'delivered':
        return 'text-cyan-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading || branchesLoading) {
    return <ServicesListSkeleton />;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">Services</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {filteredServices.length} total services
            </p>
          </div>
          
          {/* Branch Filter Dropdown */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-48 justify-between text-sm bg-white"
                  style={{ borderColor: '#925D00' }}
                >
                  {selectedBranch}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white">
                <DropdownMenuItem 
                  onClick={() => setSelectedBranch('All Branches')}
                  className={selectedBranch === 'All Branches' ? 'bg-gray-100' : ''}
                >
                  All Branches
                </DropdownMenuItem>
                {branches.map((branch) => (
                  <DropdownMenuItem 
                    key={branch._id}
                    onClick={() => setSelectedBranch(branch.branchName)}
                    className={selectedBranch === branch.branchName ? 'bg-gray-100' : ''}
                  >
                    {branch.branchName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Link href="/services/create">
          <Button 
            className="text-white w-full sm:w-auto font-medium"
            style={{ backgroundColor: '#925D00' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Service
          </Button>
        </Link>
      </div>

      {/* Search Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center">
          <div className="flex-1 lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Service ID, Customer Name, Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
        {filterOptions.map((option: string) => {
          const serviceCount = option === 'All' 
            ? filteredServices.length 
            : filteredServices.filter((service: Service) => service.action === option).length;
          
          return (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === option
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{
                backgroundColor: activeFilter === option ? '#925D00' : 'transparent'
              }}
            >
              {option}({serviceCount})
            </button>
          );
        })}
      </div>

      {/* Services Table with Date Sections */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
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
          <div className="text-center">Product</div>
          <div className="text-center">Technician</div>
          <div className="text-center">Action</div>
          <div className="text-center">Amount</div>
        </div>

        {/* Date-wise Service Sections */}
        <div className="divide-y divide-gray-200">
          {servicesByDate.map(({ date, services: dateServices }) => (
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
              <div className="divide-y divide-gray-100">
                {dateServices.map((service: Service) => (
                  <div key={service._id} className="hover:bg-gray-50 transition-colors">
                    {/* Mobile Layout */}
                    <div className="md:hidden p-4 space-y-3">
                      <Link 
                        href={`/services/view/${service._id}`} 
                        className="block" 
                        onClick={() => handleRowClick(service._id)}
                      >
                        <div className="flex justify-between items-start cursor-pointer">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 break-words flex items-center gap-2 font-mono">
                              {service.serviceId}
                              {loadingServiceId === service._id && (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-900 break-words">{service.customerName}</div>
                            <div className="text-sm text-gray-500 break-all">{service.customerContactNumber}</div>
                            <div className="text-sm text-gray-500 break-words">
                              {service.productDetails[0]?.productName || 'N/A'}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {/* Mobile Action Dropdown */}
                            <DropdownMenu 
                              open={openDropdowns.has(`mobile-action-${service._id}`)}
                              onOpenChange={(isOpen) => {
                                setOpenDropdowns(prev => {
                                  const newSet = new Set(prev);
                                  if (isOpen) {
                                    newSet.add(`mobile-action-${service._id}`);
                                  } else {
                                    newSet.delete(`mobile-action-${service._id}`);
                                  }
                                  return newSet;
                                });
                              }}
                            >
                              <DropdownMenuTrigger asChild>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  className={`text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1 font-medium ${getStatusColor(service.action)}`}
                                >
                                  <span className="truncate">
                                    {service.action.length > 10 ? `${service.action.substring(0, 10)}...` : service.action}
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
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleActionChange(service._id, action);
                                    }}
                                    className={service.action === action ? 'bg-gray-100 font-medium' : 'font-medium'}
                                  >
                                    {action}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openCostDialog(service);
                              }}
                              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1 font-medium"
                            >
                              <IndianRupee className="h-3 w-3" />
                              {service.serviceCost ? `₹${service.serviceCost}` : 'Amount'}
                            </button>
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* Desktop Layout */}
                    <Link 
                      href={`/services/view/${service._id}`} 
                      onClick={() => handleRowClick(service._id)}
                    >
                      <div 
                        className="hidden md:grid items-center cursor-pointer hover:bg-gray-100 px-6 py-4" 
                        style={{gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr 1fr 1fr 1fr", gap: "1rem"}}
                      >
                        <div className="flex justify-center items-center">
                          <div className="font-medium text-gray-900 break-words text-center flex items-center gap-2 font-mono">
                            {service.serviceId}
                            {loadingServiceId === service._id && (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex justify-center items-center">
                          <div className="text-center">
                            <div className="font-medium text-gray-900 break-words">{service.customerName}</div>
                          </div>
                        </div>
                        <div className="text-gray-900 break-all flex justify-center items-center font-medium">
                          {service.customerContactNumber}
                        </div>
                        <div className="flex justify-center items-center">
                          <div className="text-center">
                            <div className="text-gray-900 break-words font-medium">
                              {service.productDetails[0]?.productName || 'N/A'}
                            </div>
                            {service.productDetails[0]?.brand && (
                              <div className="text-xs text-gray-500 font-medium">
                                {service.productDetails[0].brand}
                              </div>
                            )}
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
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="w-full px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-between font-medium"
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
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Handle unassign if needed
                                }}
                                className="font-medium"
                              >
                                Unassigned
                              </DropdownMenuItem>
                              {technicians.map((tech: Technician) => (
                                <DropdownMenuItem 
                                  key={tech._id}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleTechnicianChange(service._id, tech._id);
                                  }}
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
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="w-full px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-between max-w-32 font-medium"
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
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleActionChange(service._id, action);
                                  }}
                                  className={service.action === action ? 'bg-gray-100 font-medium' : 'font-medium'}
                                >
                                  {action}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex justify-center items-center">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openCostDialog(service);
                            }}
                            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1 font-medium"
                          >
                            <IndianRupee className="h-3 w-3" />
                            {service.serviceCost ? `₹${service.serviceCost}` : 'Amount'}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500 font-medium">
              {searchQuery 
                ? 'No services found matching your search.' 
                : activeFilter !== 'All' 
                ? `No services found with ${activeFilter} status.`
                : 'No services found.'
              }
            </div>
          </div>
        )}
      </div>

      {/* Cost Update Modal */}
      {costDialogOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Update Service Cost</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cost" className="text-sm font-medium text-gray-700">Service Cost (₹)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  placeholder="Enter service cost"
                  className="mt-2 border-gray-300"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleCostUpdate}
                  disabled={!newCost || updateCostMutation.isPending}
                  className="flex-1 text-white font-medium"
                  style={{ backgroundColor: '#925D00' }}
                >
                  {updateCostMutation.isPending ? 'Updating...' : 'Update Cost'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCostDialogOpen(false)}
                  className="flex-1 border-gray-300 font-medium"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ServicesListSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <Skeleton className="h-12 w-96" />
      <Skeleton className="h-16 w-full" />
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="space-y-4 p-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}