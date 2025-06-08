'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useBranches } from '@/hooks/useBranches';
import { useUpdateServiceCost, useUpdateServiceAction, useAssignTechnician } from '@/hooks/useServices';
import { useTechnicians } from '@/hooks/useStaff';
import { toast } from 'sonner';
import { ApiError } from '@/types/error';

// Types
interface Service {
  _id: string;
  serviceId: string;
  customerName: string;
  customerContactNumber: string;
  action: string;
  address: string;
  location: string;
  productDetails: {
    productName: string;
    serialNumber: string;
    brand: string;
    type: string;
    productIssue: string;
    _id: string;
  };
  branchId: {
    _id: string;
    branchName: string;
    location: string;
    address: string;
  };
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [newCost, setNewCost] = useState('');
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [newServiceLoading, setNewServiceLoading] = useState(false);
  const [loadingServiceId, setLoadingServiceId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{serviceId: string, action: string} | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const servicesPerPage = 10;
  
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

  const displayServices = useMemo(() => {
    let filtered = allServices;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((service: Service) => 
        service.serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.customerContactNumber.includes(searchQuery)
      );
    }
    
    // Apply action filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(service => service.action === activeFilter);
    }
    
    // Apply branch filter
    if (selectedBranch !== 'All Branches') {
      filtered = filtered.filter(service => 
        service.branchId?.branchName === selectedBranch
      );
    }
    
    return filtered;
  }, [allServices, searchQuery, activeFilter, selectedBranch]);

  // Get unique actions for filter tabs
  const filterOptions = useMemo(() => {
  return ['All', ...ACTION_OPTIONS];
}, []);

  // Pagination logic
  const totalPages = Math.ceil(displayServices.length / servicesPerPage);
  const currentServices = useMemo(() => {
    const startIndex = (currentPage - 1) * servicesPerPage;
    const endIndex = startIndex + servicesPerPage;
    return displayServices.slice(startIndex, endIndex);
  }, [displayServices, currentPage, servicesPerPage]);

  // Group services by date
  const servicesByDate = useMemo(() => {
    const grouped = currentServices.reduce((acc: Record<string, Service[]>, service: Service) => {
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
  }, [currentServices]);

  const handleNewServiceClick = () => {
    setNewServiceLoading(true);
    setTimeout(() => {
      setNewServiceLoading(false);
      router.push('/services/create');
    }, 2000);
  };

  const handleRowClick = (serviceId: string) => {
    setLoadingServiceId(serviceId);
    router.push(`/services/view/${serviceId}`);
  };

const handleActionChange = async (e: React.MouseEvent, serviceId: string, newAction: string) => {
  e.stopPropagation();
  
  // Get the current service
  const service = allServices.find(s => s._id === serviceId);
  
  // Client-side validation for completion
  if (newAction === 'Completed') {
    if (!service?.serviceCost || service.serviceCost <= 0) {
      toast.error('Please set the service cost before marking as completed');
      return;
    }
  }
  
  // Check if moving from Completed to another status
  if (service?.action === 'Completed' && newAction !== 'Completed') {
    setPendingAction({ serviceId, action: newAction });
    setConfirmationDialogOpen(true);
    return;
  }
  
  // Check if action is Cancelled
  if (newAction === 'Cancelled') {
    setPendingAction({ serviceId, action: newAction });
    setCancellationDialogOpen(true);
    return;
  }
  
  // Proceed with regular action update
  await updateAction(serviceId, newAction);
};


const updateAction = async (serviceId: string, newAction: string, cancellationReason?: string) => {
  try {
    setLoadingActions(prev => new Set(prev).add(serviceId));
    await updateActionMutation.mutateAsync({ 
      id: serviceId, 
      action: newAction,
      cancellationReason 
    });
    
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      newSet.delete(`action-${serviceId}`);
      return newSet;
    });
  } catch (err) {
    console.error('Error updating service action:', err);
    const error= err as ApiError
    
    // Handle specific error for service completion validation
    if (error?.response?.data?.message?.includes('Service cost must be set')) {
      toast.error('Please set the service cost before marking as completed');
    } else if (error?.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Failed to update service status');
    }
  } finally {
    setLoadingActions(prev => {
      const newSet = new Set(prev);
      newSet.delete(serviceId);
      return newSet;
    });
  }
};

  const handleConfirmCancellation = async () => {
    if (pendingAction) {
      if (!cancellationReason.trim()) {
        toast.error('Cancellation reason is required');
        return;
      }
      await updateAction(pendingAction.serviceId, pendingAction.action, cancellationReason);
      setCancellationReason('');
      setCancellationDialogOpen(false);
      setPendingAction(null);
    }
  };

  const handleConfirmActionChange = async () => {
    if (pendingAction) {
      await updateAction(pendingAction.serviceId, pendingAction.action);
      setConfirmationDialogOpen(false);
      setPendingAction(null);
    }
  };

  const handleTechnicianChange = async (e: React.MouseEvent, serviceId: string, technicianId: string) => {
    e.stopPropagation();
    try {
      await assignTechnicianMutation.mutateAsync({ id: serviceId, technicianId });
      
      setOpenDropdowns(prev => {
        const newSet = new Set(prev);
        newSet.delete(`technician-${serviceId}`);
        return newSet;
      });
    } catch (error) {
      console.error('Error assigning technician:', error);
    }
  };

  const openCostDialog = (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();
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
              {displayServices.length} total services
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
                  onClick={() => {
                    setSelectedBranch('All Branches');
                    setCurrentPage(1);
                  }}
                  className={selectedBranch === 'All Branches' ? 'bg-gray-100' : ''}
                >
                  All Branches
                </DropdownMenuItem>
                {branches.map((branch) => (
                  <DropdownMenuItem 
                    key={branch._id}
                    onClick={() => {
                      setSelectedBranch(branch.branchName);
                      setCurrentPage(1);
                    }}
                    className={selectedBranch === branch.branchName ? 'bg-gray-100' : ''}
                  >
                    {branch.branchName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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

      {/* Filter Tabs */}
<div className="flex flex-wrap gap-x-6 gap-y-2">
  {filterOptions.map((option: string) => {
    let serviceCount;
    if (option === 'All') {
      // For "All", count services that match current branch and search filters
      let filtered = allServices;
      
      if (searchQuery) {
        filtered = filtered.filter((service: Service) => 
          service.serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.customerContactNumber.includes(searchQuery)
        );
      }
      
      if (selectedBranch !== 'All Branches') {
        filtered = filtered.filter(service => 
          service.branchId?.branchName === selectedBranch
        );
      }
      
      serviceCount = filtered.length;
    } else {
      // For specific actions, count services that match all filters including the action
      let filtered = allServices;
      
      if (searchQuery) {
        filtered = filtered.filter((service: Service) => 
          service.serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.customerContactNumber.includes(searchQuery)
        );
      }
      
      if (selectedBranch !== 'All Branches') {
        filtered = filtered.filter(service => 
          service.branchId?.branchName === selectedBranch
        );
      }
      
      serviceCount = filtered.filter(service => service.action === option).length;
    }
    
    return (
      <button
        key={option}
        onClick={() => {
          setActiveFilter(option);
          setCurrentPage(1);
        }}
        className={`px-2 py-2 text-sm font-medium transition-all relative ${
          activeFilter === option
            ? 'text-[#C5AA7E]'
            : 'text-gray-600 hover:text-[#C5AA7E]'
        }`}
      >
        {option}({serviceCount})
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
              placeholder="Search Service ID, Customer Name, Number"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 border-gray-300 placeholder:text-gray-400"
            />
          </div>
        </div>
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
                  <div 
                    key={service._id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(service._id)}
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 break-words font-mono flex items-center gap-2">
                            {service.serviceId}
                            {loadingServiceId === service._id && (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-900 break-words">{service.customerName}</div>
                          <div className="text-sm text-gray-500 break-all">{service.customerContactNumber}</div>
                          <div className="text-sm text-gray-500 break-words">
                            {service.productDetails?.productName || 'N/A'}
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
                                className={`text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1 font-medium ${getStatusColor(service.action)}`}
                                onClick={(e) => e.stopPropagation()}
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
                                  onClick={(e) => handleActionChange(e, service._id, action)}
                                  className={service.action === action ? 'bg-gray-100 font-medium' : 'font-medium'}
                                >
                                  {action}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => openCostDialog(e, service)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1 font-medium"
                            >
                              <IndianRupee className="h-3 w-3" />
                              {service.serviceCost ? `${service.serviceCost}` : 'Amount'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div 
                      className="hidden md:grid items-center hover:bg-gray-100 px-6 py-4" 
                      style={{gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr 1fr 1fr 1fr", gap: "1rem"}}
                    >
                      <div className="flex justify-center items-center">
                        <div className="font-medium text-gray-900 break-words text-center font-mono flex items-center gap-2">
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
                            {service.productDetails?.productName || 'N/A'}
                          </div>
                          {service.productDetails?.brand && (
                            <div className="text-xs text-gray-500 font-medium">
                              {service.productDetails.brand}
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
                            {technicians.map((tech: Technician) => (
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
                        <button 
                          onClick={(e) => openCostDialog(e, service)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1 font-medium"
                        >
                          <IndianRupee className="h-3 w-3" />
                          {service.serviceCost ? `${service.serviceCost}` : 'Amount'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {displayServices.length === 0 && (
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

        {/* Pagination Controls */}
        {displayServices.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * servicesPerPage + 1, displayServices.length)} to{' '}
              {Math.min(currentPage * servicesPerPage, displayServices.length)} of{' '}
              {displayServices.length} services
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-gray-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
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

      {/* Cancellation Reason Dialog */}
      {cancellationDialogOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Cancellation Reason</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason" className="text-sm font-medium text-gray-700">Reason for Cancellation</Label>
                <Input
                  id="reason"
                  type="text"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Enter reason for cancellation"
                  className="mt-2 border-gray-300"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleConfirmCancellation}
                  disabled={!cancellationReason.trim()}
                  className="flex-1 text-white font-medium"
                  style={{ backgroundColor: '#925D00' }}
                >
                  Confirm Cancellation
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCancellationDialogOpen(false);
                    setCancellationReason('');
                  }}
                  className="flex-1 border-gray-300 font-medium"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Completed to Other Status */}
{confirmationDialogOpen && (
  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Confirm Action Change</h3>
      <div className="space-y-4">
        <p className="text-gray-700">
          Changing status from Completed&apos; to &apos;{pendingAction?.action}&apos; will reset the service cost to 0. Do you want to proceed?
        </p>
        <div className="flex gap-3">
          <Button 
            onClick={handleConfirmActionChange}
            className="flex-1 text-white font-medium"
            style={{ backgroundColor: '#925D00' }}
          >
            Confirm
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setConfirmationDialogOpen(false);
              setPendingAction(null);
            }}
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