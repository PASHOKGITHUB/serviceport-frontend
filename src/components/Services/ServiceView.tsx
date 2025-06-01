'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronRight, 
  Edit, 
  DollarSign, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  Package,
  FileText,
  Settings
} from 'lucide-react';
import { useService, useUpdateServiceAction, useAssignTechnician, useUpdateServiceCost } from '@/hooks/useServices';
import { useTechnicians } from '@/hooks/useStaff';
import { getStatusColor, formatDate } from '@/lib/utils';
import type { Staff, ProductDetails, User as UserType } from '@/domain/entities/service';

// Status hierarchy for validation
const STATUS_HIERARCHY = [
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

interface ServiceViewProps {
  serviceId?: string;
}

export default function ServiceView({ serviceId: propServiceId }: ServiceViewProps) {
  const params = useParams();
  const serviceId = propServiceId || (params.id as string);
  
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [newCost, setNewCost] = useState('');
  
  const { data: service, isLoading } = useService(serviceId);
  const { data: techniciansResponse } = useTechnicians();
  
  const technicians = techniciansResponse || [];
  
  const updateActionMutation = useUpdateServiceAction();
  const assignTechnicianMutation = useAssignTechnician();
  const updateCostMutation = useUpdateServiceCost();

  // Get valid next statuses based on current status
  const getValidNextStatuses = (currentStatus: string) => {
    const currentIndex = STATUS_HIERARCHY.indexOf(currentStatus);
    if (currentIndex === -1) return STATUS_HIERARCHY;
    
    // Allow current status, next status, and cancelled
    const validStatuses = [currentStatus];
    if (currentIndex < STATUS_HIERARCHY.length - 2) {
      validStatuses.push(STATUS_HIERARCHY[currentIndex + 1]);
    }
    if (currentStatus !== 'Cancelled') {
      validStatuses.push('Cancelled');
    }
    return validStatuses;
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateActionMutation.mutateAsync({ id: serviceId, action: newStatus });
    } catch (err) {
      console.error('Error updating service status:', err);
    }
  };

  const handleTechnicianChange = async (technicianId: string) => {
    try {
      await assignTechnicianMutation.mutateAsync({ id: serviceId, technicianId });
    } catch (error) {
      console.error('Error assigning technician:', error);
    }
  };

  const handleCostUpdate = async () => {
    if (newCost) {
      try {
        await updateCostMutation.mutateAsync({ 
          id: serviceId, 
          serviceCost: parseFloat(newCost) 
        });
        setCostDialogOpen(false);
        setNewCost('');
      } catch (error) {
        console.error('Error updating service cost:', error);
      }
    }
  };

  const openCostDialog = () => {
    setNewCost(service?.serviceCost?.toString() || '');
    setCostDialogOpen(true);
  };

  if (isLoading) {
    return <ServiceViewSkeleton />;
  }

  if (!service) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">Service not found</div>
          <Link href="/services">
            <Button>Back to Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/services" className="text-gray-600 hover:text-gray-900 transition-colors">
          Services
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-red-600 font-medium">{service.serviceId}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Service Details
          </h1>
          <p className="text-gray-600 text-sm sm:text-base font-mono">
            {service.serviceId}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href={`/services/edit/${service._id}`}>
            <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Edit Service
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="outline" className="w-full sm:w-auto">
              Back to List
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Customer Name</Label>
                  <p className="text-gray-900 font-medium">{service.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Contact Number</Label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {service.customerContactNumber}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Location</Label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {service.location}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-gray-900">{service.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {service.productDetails.map((product: ProductDetails, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-3">Product {index + 1}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Product Name</Label>
                        <p className="text-gray-900">{product.productName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Serial Number</Label>
                        <p className="text-gray-900 font-mono">{product.serialNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Brand</Label>
                        <p className="text-gray-900">{product.brand}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Type</Label>
                        <p className="text-gray-900">{product.type}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-500">Product Issue</Label>
                      <p className="text-gray-900 mt-1">{product.productIssue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Timeline */}
          <Card>
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Service Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Received Date</Label>
                  <p className="text-gray-900">{formatDate(service.receivedDate || service.createdAt)}</p>
                </div>
                {service.deliveredDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Delivered Date</Label>
                    <p className="text-gray-900">{formatDate(service.deliveredDate)}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created Date</Label>
                  <p className="text-gray-900">{formatDate(service.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <p className="text-gray-900">{formatDate(service.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Actions */}
          <Card>
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Service Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Current Status */}
              <div>
                <Label className="text-sm font-medium text-gray-500">Current Status</Label>
                <div className="mt-2">
                  <Badge className={getStatusColor(service.action)}>
                    {service.action}
                  </Badge>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <Label className="text-sm font-medium text-gray-500">Update Status</Label>
                <Select 
                  value={service.action}
                  onValueChange={handleStatusChange}
                  disabled={updateActionMutation.isPending}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getValidNextStatuses(service.action).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assign Technician */}
              <div>
                <Label className="text-sm font-medium text-gray-500">Assigned Technician</Label>
                <Select 
                  value={service.technician?._id || "unassigned"}
                  onValueChange={(value) => {
                    if (value !== "unassigned") {
                      handleTechnicianChange(value);
                    }
                  }}
                  disabled={assignTechnicianMutation.isPending}
                >
                  <SelectTrigger className="mt-2">
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
                {service.technician && (
                  <p className="text-sm text-gray-600 mt-1">
                    Currently: {service.technician.staffName}
                  </p>
                )}
              </div>

              {/* Service Cost */}
              <div>
                <Label className="text-sm font-medium text-gray-500">Service Cost</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={openCostDialog}
                    className="flex-1"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    ₹{service.serviceCost || 'Not set'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card>
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Service ID</Label>
                <p className="text-gray-900 font-mono">{service.serviceId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Total Products</Label>
                <p className="text-gray-900">{service.productDetails.length}</p>
              </div>
              {service.createdBy && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created By</Label>
                  <p className="text-gray-900">{(service.createdBy as UserType).name || 'System'}</p>
                </div>
              )}
              {service.updatedBy && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated By</Label>
                  <p className="text-gray-900">{(service.updatedBy as UserType).name || 'System'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cost Update Modal */}
      {costDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
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
    </div>
  );
}

function ServiceViewSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}