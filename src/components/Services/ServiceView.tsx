'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronRight, 
  Edit,
  Loader2,
} from 'lucide-react';
import { useService } from '@/hooks/useServices';
import type { ProductDetails } from '@/domain/entities/service';

// Status hierarchy for validation
// const STATUS_HIERARCHY = [
//   'Received',
//   'Assigned to Technician',
//   'Under Inspection',
//   'Waiting for Customer Approval',
//   'Approved',
//   'In Service',
//   'Finished',
//   'Delivered',
//   'Completed',
//   'Cancelled'
// ];

interface ServiceViewProps {
  serviceId?: string;
}

export default function ServiceView({ serviceId: propServiceId }: ServiceViewProps) {
  const params = useParams();
  const router = useRouter();
  const serviceId = propServiceId || (params.id as string);
  
  // const [costDialogOpen, setCostDialogOpen] = useState(false);
  // const [newCost, setNewCost] = useState('');
  const [isEditLoading, setIsEditLoading] = useState(false);
  
  const { data: service, isLoading } = useService(serviceId);
  
  // const technicians = techniciansResponse || [];
  
  // const updateActionMutation = useUpdateServiceAction();
  // const assignTechnicianMutation = useAssignTechnician();
  // const updateCostMutation = useUpdateServiceCost();

  // Get valid next statuses based on current status
  // const getValidNextStatuses = (currentStatus: string) => {
  //   const currentIndex = STATUS_HIERARCHY.indexOf(currentStatus);
  //   if (currentIndex === -1) return STATUS_HIERARCHY;
    
  //   // Allow current status, next status, and cancelled
  //   const validStatuses = [currentStatus];
  //   if (currentIndex < STATUS_HIERARCHY.length - 2) {
  //     validStatuses.push(STATUS_HIERARCHY[currentIndex + 1]);
  //   }
  //   if (currentStatus !== 'Cancelled') {
  //     validStatuses.push('Cancelled');
  //   }
  //   return validStatuses;
  // };

  // const handleStatusChange = async (newStatus: string) => {
  //   try {
  //     await updateActionMutation.mutateAsync({ id: serviceId, action: newStatus });
  //   } catch (err) {
  //     console.error('Error updating service status:', err);
  //   }
  // };

  // const handleTechnicianChange = async (technicianId: string) => {
  //   try {
  //     await assignTechnicianMutation.mutateAsync({ id: serviceId, technicianId });
  //   } catch (error) {
  //     console.error('Error assigning technician:', error);
  //   }
  // };

  // const handleCostUpdate = async () => {
  //   if (newCost) {
  //     try {
  //       await updateCostMutation.mutateAsync({ 
  //         id: serviceId, 
  //         serviceCost: parseFloat(newCost) 
  //       });
  //       setCostDialogOpen(false);
  //       setNewCost('');
  //     } catch (error) {
  //       console.error('Error updating service cost:', error);
  //     }
  //   }
  // };

  // const openCostDialog = () => {
  //   setNewCost(service?.serviceCost?.toString() || '');
  //   setCostDialogOpen(true);
  // };

  const handleEditClick = async () => {
    setIsEditLoading(true);
    try {
      await router.push(`/services/edit/${service._id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setIsEditLoading(false);
    }
  };

  if (isLoading) {
    return <ServiceViewSkeleton />;
  }

  if (!service) {
    return (
      <div className="min-h-screen">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/services" className="text-gray-600 hover:text-gray-900 transition-colors">
                Services
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-amber-700 font-medium">Service Details</span>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Service not found</div>
            <Link href="/services">
              <Button className="bg-amber-700 hover:bg-amber-800 text-white">Back to Services</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with buttons */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link href="/services" className="text-gray-600 hover:text-gray-900 transition-colors">
              Services
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-amber-700 font-medium">{service.serviceId}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleEditClick}
              disabled={isEditLoading}
              className="px-6 py-2 rounded-lg font-medium flex items-center gap-2 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#925D00' }}
            >
              {isEditLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
              {isEditLoading ? 'Loading...' : 'Edit Service'}
            </Button>
            <Link href="/services">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium"
              >
                Back to List
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Form content - Matching width to edit form */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          {/* Service ID - Normal display with label */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-black">
              Service ID
            </Label>
            <Input
              value={service.serviceId}
              readOnly
              className="h-11 w-50 px-3 border border-gray-300 rounded-md text-gray-900 bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* Customer Details Card */}
          <Card className="shadow-sm border-gray-200 overflow-hidden bg-transparent rounded-none p-0">
            <CardHeader className="py-6 bg-[#EFEAE3] w-full">
              <CardTitle className="text-lg text-center text-black font-medium">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-transparent">
              <div className="space-y-8">
                {/* First Row - Customer Name and Contact Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-black">
                      Customer Name
                    </Label>
                    <Input
                      value={service.customerName || ''}
                      readOnly
                      className="h-11 w-full px-3 border border-gray-300 rounded-md text-gray-900 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-black">
                      Contact Number
                    </Label>
                    <Input
                      value={service.customerContactNumber || ''}
                      readOnly
                      className="h-11 w-full px-3 border border-gray-300 rounded-md text-gray-900 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Second Row - Location and Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-black">
                      Location
                    </Label>
                    <Input
                      value={service.location || ''}
                      readOnly
                      className="h-11 w-full px-3 border border-gray-300 rounded-md text-gray-900 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-black">
                      Address
                    </Label>
                    <Textarea
                      value={service.address || ''}
                      readOnly
                      className="min-h-[120px] w-full px-3 border border-gray-300 rounded-md text-gray-900 bg-gray-50 cursor-not-allowed resize-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Details Card */}
          <Card className="shadow-sm border-gray-200 overflow-hidden bg-transparent rounded-none p-0">
            <CardHeader className="py-6 bg-[#EFEAE3] w-full">
              <CardTitle className="text-lg text-center text-black font-medium">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-transparent">
              <div className="space-y-8">
                {service.productDetails.map((product: ProductDetails, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-6 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-black text-lg">Product {index + 1}</h3>
                    </div>
                    
                    {/* First Row - Product Name and Serial Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-black">
                          Product Name
                        </Label>
                        <Input
                          value={product.productName}
                          readOnly
                          className="h-11 w-full px-3 border border-gray-300 rounded-md text-gray-900  cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-black">
                          Serial Number
                        </Label>
                        <Input
                          value={product.serialNumber}
                          readOnly
                          className="h-11 w-full px-3 border border-gray-300 rounded-md text-gray-900  cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Second Row - Brand and Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-black">
                          Brand
                        </Label>
                        <Input
                          value={product.brand}
                          readOnly
                          className="h-11 w-full px-3 border border-gray-300 rounded-md text-gray-900 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-black">
                          Type
                        </Label>
                        <Input
                          value={product.type}
                          readOnly
                          className="h-11 w-full px-3 border border-gray-300 rounded-md text-gray-900  cursor-not-allowed"
                        />
                      </div>
                    </div>
                    
                    {/* Third Row - Product Issue (Full Width) */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-black">
                        Product Issue
                      </Label>
                      <Textarea
                        value={product.productIssue}
                        readOnly
                        className="min-h-[120px] w-full px-3 border border-gray-300 rounded-md text-gray-900  cursor-not-allowed resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ServiceViewSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Form content - Updated skeleton width */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          {/* Service ID */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full" />
          </div>

          {/* Form Cards */}
          <Card className="border-gray-200">
            <CardHeader className="bg-[#EFEAE3]">
              <Skeleton className="h-6 w-40 mx-auto" />
            </CardHeader>
            <CardContent className="p-8">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          
          <Card className="border-gray-200">
            <CardHeader className="bg-[#EFEAE3]">
              <Skeleton className="h-6 w-32 mx-auto" />
            </CardHeader>
            <CardContent className="p-8">
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="bg-[#EFEAE3]">
              <Skeleton className="h-6 w-40 mx-auto" />
            </CardHeader>
            <CardContent className="p-8">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}