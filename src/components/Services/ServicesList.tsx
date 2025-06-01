'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  IndianRupee, 
  MoreHorizontal, 
  Search, 
  X,
  MapPin
} from 'lucide-react';
import { useServices, useDeleteService } from '@/hooks/useServices';
import { useTechnicians } from '@/hooks/useStaff';
import { useBranches } from '@/hooks/useBranches';
import { useUpdateServiceAction, useAssignTechnician, useUpdateServiceCost } from '@/hooks/useServices';
import { getStatusColor } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import type { Service, ProductDetails, Staff } from '@/domain/entities/service';

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

const TIME_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: 'quarter', label: 'Last Quarter' },
];

export default function ServicesList() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [newCost, setNewCost] = useState('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  
  const { data: servicesResponse, isLoading } = useServices();
  const { data: techniciansResponse } = useTechnicians();
  const { data: branchesData } = useBranches();
  
  // Extract data from API responses using useMemo to prevent unnecessary recalculations
  const allServices = useMemo(() => 
    servicesResponse?.data?.services || [], 
    [servicesResponse?.data?.services]
  );
  
  const technicians = useMemo(() => 
    techniciansResponse || [], 
    [techniciansResponse]
  );
  
  const branches = useMemo(() => 
    branchesData || [], 
    [branchesData]
  );
  
  const updateActionMutation = useUpdateServiceAction();
  const assignTechnicianMutation = useAssignTechnician();
  const updateCostMutation = useUpdateServiceCost();
  const deleteServiceMutation = useDeleteService();

  // Helper function to get branch name
  const getBranchName = (service: Service): string => {
    if (typeof service.branchId === 'object' && service.branchId?.branchName) {
      return service.branchId.branchName;
    }
    // Fallback to find branch name from branches array
    const branch = branches.find(b => b._id === (typeof service.branchId === 'string' ? service.branchId : service.branchId?._id));
    return branch?.branchName || 'Unknown Branch';
  };

  // Helper function to get branch location
  const getBranchLocation = (service: Service): string => {
    if (typeof service.branchId === 'object' && service.branchId?.location) {
      return service.branchId.location;
    }
    // Fallback to find branch location from branches array
    const branch = branches.find(b => b._id === (typeof service.branchId === 'string' ? service.branchId : service.branchId?._id));
    return branch?.location || 'Unknown Location';
  };

  // Filter services based on all criteria
  const filteredServices = useMemo(() => {
    let filtered = [...allServices];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.serviceId.toLowerCase().includes(query) ||
        service.customerName.toLowerCase().includes(query) ||
        service.customerContactNumber.includes(query) ||
        service.location.toLowerCase().includes(query) ||
        getBranchName(service).toLowerCase().includes(query) ||
        service.productDetails.some((product: ProductDetails) => 
          product.productName.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query)
        )
      );
    }

    // Branch filter - FIXED TO HANDLE BOTH STRING AND POPULATED OBJECT
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(service => {
        // Handle both string branchId and populated branch object
        const serviceBranchId = typeof service.branchId === 'string' 
          ? service.branchId 
          : service.branchId?._id;
        return serviceBranchId === selectedBranch;
      });
    }

    // Action filter
    if (selectedAction !== 'all') {
      filtered = filtered.filter(service => service.action === selectedAction);
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(service => 
        new Date(service.createdAt) >= filterDate
      );
    }

    return filtered;
  }, [allServices, searchQuery, selectedBranch, selectedAction, timeFilter, branches]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBranch('all');
    setSelectedAction('all');
    setTimeFilter('all');
  };

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

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (serviceToDelete) {
      try {
        await deleteServiceMutation.mutateAsync(serviceToDelete._id);
        setDeleteDialogOpen(false);
        setServiceToDelete(null);
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const openCostDialog = (service: Service) => {
    setSelectedService(service);
    setNewCost(service.serviceCost?.toString() || '');
    setCostDialogOpen(true);
  };

  if (isLoading) {
    return <ServicesListSkeleton />;
  }

  const hasActiveFilters = searchQuery || selectedBranch !== 'all' || selectedAction !== 'all' || timeFilter !== 'all';

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {hasActiveFilters ? `${filteredServices.length} of ${allServices.length}` : `${allServices.length} total`} service requests
          </p>
        </div>
        <Link href="/services/create">
          <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Service
          </Button>
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search Bar - Left Side */}
          <div className="flex-1 lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by Service ID, Customer, Phone, Product, Branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Right Side Filters - Closely Spaced */}
          <div className="flex items-center gap-2">
            {/* Branch Filter */}
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-40">
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

            {/* Action Filter */}
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {ACTION_HIERARCHY.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Time Filter */}
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                {TIME_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="flex items-center gap-1 whitespace-nowrap ml-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Desktop Table Header - Updated with Branch Column */}
        <div className="hidden md:grid bg-red-600 text-white px-6 py-4 text-sm font-medium" style={{gridTemplateColumns: "1fr 1.2fr 1fr 1fr 1.2fr 1.5fr 2fr 0.6fr", gap: "1rem"}}>
          <div className="text-center">Service ID</div>
          <div className="text-center">Customer</div>
          <div className="text-center">Phone</div>
          <div className="text-center">Branch</div>
          <div className="text-center">Product</div>
          <div className="text-center">Technician</div>
          <div className="text-center">Action</div>
          <div className="text-center">More</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {filteredServices.map((service: Service) => (
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
                    <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{getBranchName(service)} - {getBranchLocation(service)}</span>
                    </div>
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
                      {technicians.map((tech: Staff) => (
                        <SelectItem key={tech._id} value={tech._id}>
                          {tech.staffName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="relative">
                    <Select 
                      value={service.action}
                      onValueChange={(value) => handleActionChange(service._id, value)}
                    >
                      <SelectTrigger className="w-full h-9 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
                        <div className="flex items-center gap-2 min-w-0">
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
                          <span className="truncate text-sm">{service.action}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
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
                              {action}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <MoreHorizontal className="h-4 w-4 mr-2" />
                          More Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-48">
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
                        <DropdownMenuItem 
                          onClick={() => openCostDialog(service)}
                          className="flex items-center"
                        >
                          <IndianRupee className="h-4 w-4 mr-2" />
                          Update Cost
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(service)}
                          className="flex items-center text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Service
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Desktop Layout - Updated with Branch Column */}
              <div className="hidden md:grid items-center hover:bg-gray-50 transition-colors" style={{gridTemplateColumns: "1fr 1.2fr 1fr 1fr 1.2fr 1.5fr 2fr 0.6fr", gap: "1rem"}}>
                <div className="font-medium text-gray-900 break-all font-mono text-sm flex justify-center">
                  {service.serviceId}
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="font-medium text-gray-900 break-words">{service.customerName}</div>
                  <div className="text-sm text-gray-500 break-words">{service.location}</div>
                </div>
                <div className="text-gray-900 break-all flex justify-center items-center">{service.customerContactNumber}</div>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="font-medium text-gray-900 break-words flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-600" />
                    {getBranchName(service)}
                  </div>
                  <div className="text-sm text-gray-500 break-words">{getBranchLocation(service)}</div>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="font-medium text-gray-900 break-words">
                    {service.productDetails[0]?.productName || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500 break-words">
                    {service.productDetails[0]?.brand || ''}
                  </div>
                  {service.serviceCost && (
                    <div className="text-sm text-green-600 font-medium mt-1">
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
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent>
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
                    <SelectTrigger className="w-full h-9 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
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
                        <span className="truncate text-sm">{service.action}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
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
                            {action}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-center items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                      <DropdownMenuItem 
                        onClick={() => openCostDialog(service)}
                        className="flex items-center"
                      >
                        <IndianRupee className="h-4 w-4 mr-2" />
                        Update Cost
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(service)}
                        className="flex items-center text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Service
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500 mb-4">
              {hasActiveFilters ? 'No services match your filters.' : 'No services found.'}
            </div>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            ) : (
              <Link href="/services/create">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Service
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Cost Update Modal */}
      {costDialogOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Update Service Cost</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cost" className="text-sm font-medium">Service Cost (₹)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  placeholder="Enter service cost"
                  className="mt-2"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleCostUpdate}
                  disabled={!newCost || updateCostMutation.isPending}
                  className="flex-1"
                >
                  {updateCostMutation.isPending ? 'Updating...' : 'Update Cost'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCostDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Service"
        description={`Are you sure you want to delete service ${serviceToDelete?.serviceId}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleteServiceMutation.isPending}
      />
    </div>
  );
}

function ServicesListSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
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