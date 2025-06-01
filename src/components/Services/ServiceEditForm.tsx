// src/components/Services/EditServiceForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { useService, useUpdateService } from '@/hooks/useServices';
import type { UpdateServiceRequest, ProductDetails } from '@/domain/entities/service';

interface EditServiceFormProps {
  serviceId: string;
}

export default function EditServiceForm({ serviceId }: EditServiceFormProps) {
  const router = useRouter();
  
  const { data: service, isLoading } = useService(serviceId);
  const updateServiceMutation = useUpdateService();

  const [formData, setFormData] = useState<UpdateServiceRequest>({
    customerName: '',
    customerContactNumber: '',
    address: '',
    location: '',
    productDetails: [
      { productName: '', serialNumber: '', brand: '', type: '', productIssue: '' }
    ],
    serviceCost: undefined,
  });

  // Update form data when service is loaded
  useEffect(() => {
    if (service) {
      setFormData({
        customerName: service.customerName || '',
        customerContactNumber: service.customerContactNumber || '',
        address: service.address || '',
        location: service.location || '',
        productDetails: service.productDetails || [
          { productName: '', serialNumber: '', brand: '', type: '', productIssue: '' }
        ],
        serviceCost: service.serviceCost,
      });
    }
  }, [service]);

  const addProduct = () => {
    setFormData({
      ...formData,
      productDetails: [
        ...(formData.productDetails || []),
        { productName: '', serialNumber: '', brand: '', type: '', productIssue: '' }
      ]
    });
  };

  const removeProduct = (index: number) => {
    if (formData.productDetails && formData.productDetails.length > 1) {
      const newProducts = formData.productDetails.filter((_, i) => i !== index);
      setFormData({ ...formData, productDetails: newProducts });
    }
  };

  const updateProduct = (index: number, field: keyof ProductDetails, value: string) => {
    if (!formData.productDetails) return;
    const newProducts = [...formData.productDetails];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setFormData({ ...formData, productDetails: newProducts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateServiceMutation.mutateAsync({
        id: serviceId,
        data: formData
      });
      router.push(`/services/view/${serviceId}`);
    } catch (err) {
      console.error('Error updating service:', err);
    }
  };

  if (isLoading) {
    return <EditServiceFormSkeleton />;
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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/services" className="text-gray-600 hover:text-gray-900 transition-colors">
          Services
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <Link href={`/services/view/${serviceId}`} className="text-gray-600 hover:text-gray-900 transition-colors">
          {service.serviceId}
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-red-600 font-medium">Edit</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Service</h1>
            <p className="text-gray-600 text-sm sm:text-base font-mono">
              {service.serviceId}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 transition-colors order-2 sm:order-1"
              disabled={updateServiceMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateServiceMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link href={`/services/view/${serviceId}`} className="order-1 sm:order-2">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
          </div>
        </div>

        {/* Customer Details */}
        <Card className="animate-fade-in">
          <CardHeader className="bg-gray-50 rounded-t-lg">
            <CardTitle className="text-lg sm:text-xl">Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-sm font-medium">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter customer name"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerContact" className="text-sm font-medium">Contact Number *</Label>
                <Input
                  id="customerContact"
                  value={formData.customerContactNumber}
                  onChange={(e) => setFormData({ ...formData, customerContactNumber: e.target.value })}
                  placeholder="Enter contact number"
                  className="h-10"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceCost" className="text-sm font-medium">Service Cost (₹)</Label>
                <Input
                  id="serviceCost"
                  type="number"
                  value={formData.serviceCost || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    serviceCost: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  placeholder="Enter service cost"
                  className="h-10"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full address"
                className="min-h-[80px] resize-none"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card className="animate-fade-in">
          <CardHeader className="bg-gray-50 rounded-t-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg sm:text-xl">Product Details</CardTitle>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addProduct}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {(formData.productDetails || []).map((product, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">Product {index + 1}</h3>
                  {formData.productDetails && formData.productDetails.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProduct(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`productName-${index}`} className="text-sm font-medium">Product Name *</Label>
                    <Input
                      id={`productName-${index}`}
                      value={product.productName}
                      onChange={(e) => updateProduct(index, 'productName', e.target.value)}
                      placeholder="Enter product name"
                      className="h-10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`serialNumber-${index}`} className="text-sm font-medium">Serial Number</Label>
                    <Input
                      id={`serialNumber-${index}`}
                      value={product.serialNumber}
                      onChange={(e) => updateProduct(index, 'serialNumber', e.target.value)}
                      placeholder="Enter serial number"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`brand-${index}`} className="text-sm font-medium">Brand *</Label>
                    <Input
                      id={`brand-${index}`}
                      value={product.brand}
                      onChange={(e) => updateProduct(index, 'brand', e.target.value)}
                      placeholder="Enter brand"
                      className="h-10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`type-${index}`} className="text-sm font-medium">Type *</Label>
                    <Input
                      id={`type-${index}`}
                      value={product.type}
                      onChange={(e) => updateProduct(index, 'type', e.target.value)}
                      placeholder="Enter product type"
                      className="h-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`issue-${index}`} className="text-sm font-medium">Product Issue *</Label>
                  <Textarea
                    id={`issue-${index}`}
                    value={product.productIssue}
                    onChange={(e) => updateProduct(index, 'productIssue', e.target.value)}
                    placeholder="Describe the issue"
                    className="min-h-[80px] resize-none"
                    required
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Service Information (Read-only) */}
        <Card className="animate-fade-in">
          <CardHeader className="bg-gray-50 rounded-t-lg">
            <CardTitle className="text-lg sm:text-xl">Service Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Service ID</Label>
                <p className="text-gray-900 font-mono mt-1">{service.serviceId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Current Status</Label>
                <p className="text-gray-900 mt-1">{service.action}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Assigned Technician</Label>
                <p className="text-gray-900 mt-1">
                  {service.technician?.staffName || 'Not assigned'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Created Date</Label>
                <p className="text-gray-900 mt-1">{new Date(service.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                <p className="text-gray-900 mt-1">{new Date(service.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            type="submit" 
            className="bg-red-600 hover:bg-red-700 transition-colors"
            disabled={updateServiceMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateServiceMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
          </Button>
          <Link href={`/services/view/${serviceId}`}>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </Link>
          <Link href="/services">
            <Button type="button" variant="ghost" className="w-full sm:w-auto">
              Back to Services
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

function EditServiceFormSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Form Cards */}
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
      
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}