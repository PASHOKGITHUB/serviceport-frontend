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
import { toast } from 'sonner';
import { ChevronRight, Plus, Trash2, Save, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useService, useUpdateService } from '@/hooks/useServices';
import type { UpdateServiceRequest, ProductDetails } from '@/domain/entities/service';
import { ApiError } from '@/types/error';

interface ValidationErrors {
  customerName?: string;
  customerContactNumber?: string;
  address?: string;
  location?: string;
  productDetails?: { [key: number]: { [key: string]: string } };
}

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
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

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
      });
    }
  }, [service]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Customer name validation - with null check
    if (!formData.customerName?.trim()) {
      errors.customerName = 'Customer name is required';
    }

    // Contact number validation - with null check
    if (!formData.customerContactNumber?.trim()) {
      errors.customerContactNumber = 'Contact number is required';
    } else if (formData.customerContactNumber.replace(/\D/g, '').length < 10) {
      errors.customerContactNumber = 'Contact number must be at least 10 digits';
    }

    // Address validation - with null check
    if (!formData.address?.trim()) {
      errors.address = 'Address is required';
    }

    // Location validation - with null check
    if (!formData.location?.trim()) {
      errors.location = 'Location is required';
    }

    // Product details validation
    const productErrors: { [key: number]: { [key: string]: string } } = {};
    formData.productDetails?.forEach((product, index) => {
      const productError: { [key: string]: string } = {};
      
      if (!product.productName.trim()) {
        productError.productName = 'Product name is required';
      }
      if (!product.brand.trim()) {
        productError.brand = 'Brand is required';
      }
      if (!product.type.trim()) {
        productError.type = 'Type is required';
      }
      if (!product.productIssue.trim()) {
        productError.productIssue = 'Product issue is required';
      }

      if (Object.keys(productError).length > 0) {
        productErrors[index] = productError;
      }
    });

    if (Object.keys(productErrors).length > 0) {
      errors.productDetails = productErrors;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
      
      // Clear validation errors for removed product
      if (validationErrors.productDetails) {
        const newProductErrors = { ...validationErrors.productDetails };
        delete newProductErrors[index];
        setValidationErrors({ ...validationErrors, productDetails: newProductErrors });
      }
    }
  };

  const updateProduct = (index: number, field: keyof ProductDetails, value: string) => {
    if (!formData.productDetails) return;
    const newProducts = [...formData.productDetails];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setFormData({ ...formData, productDetails: newProducts });

    // Clear validation error for this field
    if (validationErrors.productDetails?.[index]?.[field]) {
      const newProductErrors = { ...validationErrors.productDetails };
      delete newProductErrors[index][field];
      if (Object.keys(newProductErrors[index]).length === 0) {
        delete newProductErrors[index];
      }
      setValidationErrors({ ...validationErrors, productDetails: newProductErrors });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error('Validation Error', {
        description: 'Please fix the errors below and try again.',
      });
      return;
    }
    
    try {
      await updateServiceMutation.mutateAsync({
        id: serviceId,
        data: formData
      });
      toast.success('Service updated successfully!');
      router.push('/services');
    } catch (err) {
      console.error('Error updating service:', err);

      const error=err as ApiError
      
      if (error?.response?.data?.message) {
        toast.error('Error', {
          description: error.response.data.message,
        });
      } else {
        toast.error('Failed to update service. Please try again.');
      }
    }
  };

  // Consistent styling classes for all form inputs
  const inputClasses = "h-11 w-full px-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500";
  const errorInputClasses = "border-red-500 focus:border-red-500 focus:ring-red-500";

  if (isLoading) {
    return <EditServiceFormSkeleton />;
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
              <span className="text-amber-700 font-medium">Edit Service</span>
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
            <Link href={`/services/view/${serviceId}`} className="text-gray-600 hover:text-gray-900 transition-colors">
              {service.serviceId}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-amber-700 font-medium">Edit Service</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSubmit}
              style={{ backgroundColor: '#925D00' }}
              className="hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              disabled={updateServiceMutation.isPending}
            >
              {updateServiceMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  save
                </>
              )}
            </Button>
            <Link href={`/services/view/${serviceId}`}>
              <Button 
                type="button" 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Form content - Increased width to max-w-6xl */}
      <div className="max-w-6xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Label htmlFor="customerName" className="text-sm font-medium text-black">
                      Customer Name
                    </Label>
                    <Input
                      id="customerName"
                      value={formData.customerName || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, customerName: e.target.value });
                        if (validationErrors.customerName) {
                          setValidationErrors({ ...validationErrors, customerName: undefined });
                        }
                      }}
                      placeholder="Enter customer name"
                      className={`${inputClasses} ${
                        validationErrors.customerName ? errorInputClasses : ''
                      }`}
                      required
                    />
                    {validationErrors.customerName && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationErrors.customerName}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="customerContact" className="text-sm font-medium text-black">
                      Contact Number
                    </Label>
                    <Input
                      id="customerContact"
                      value={formData.customerContactNumber || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, customerContactNumber: e.target.value });
                        if (validationErrors.customerContactNumber) {
                          setValidationErrors({ ...validationErrors, customerContactNumber: undefined });
                        }
                      }}
                      placeholder="Enter contact number"
                      className={`${inputClasses} ${
                        validationErrors.customerContactNumber ? errorInputClasses : ''
                      }`}
                      required
                    />
                    {validationErrors.customerContactNumber && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationErrors.customerContactNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Second Row - Location and Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="location" className="text-sm font-medium text-black">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, location: e.target.value });
                        if (validationErrors.location) {
                          setValidationErrors({ ...validationErrors, location: undefined });
                        }
                      }}
                      placeholder="Enter location"
                      className={`${inputClasses} ${
                        validationErrors.location ? errorInputClasses : ''
                      }`}
                      required
                    />
                    {validationErrors.location && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationErrors.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-sm font-medium text-black">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        if (validationErrors.address) {
                          setValidationErrors({ ...validationErrors, address: undefined });
                        }
                      }}
                      placeholder="Enter full address"
                      className={`min-h-[120px] w-full px-3 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                        validationErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      required
                    />
                    {validationErrors.address && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{validationErrors.address}</span>
                      </div>
                    )}
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
                {(formData.productDetails || []).map((product, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-6 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-black text-lg">Product {index + 1}</h3>
                      {formData.productDetails && formData.productDetails.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* First Row - Product Name and Serial Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor={`productName-${index}`} className="text-sm font-medium text-black">
                          Product Name
                        </Label>
                        <Input
                          id={`productName-${index}`}
                          value={product.productName}
                          onChange={(e) => updateProduct(index, 'productName', e.target.value)}
                          placeholder="Enter product name"
                          className={`${inputClasses} bg-white ${
                            validationErrors.productDetails?.[index]?.productName ? errorInputClasses : ''
                          }`}
                          required
                        />
                        {validationErrors.productDetails?.[index]?.productName && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>{validationErrors.productDetails[index].productName}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor={`serialNumber-${index}`} className="text-sm font-medium text-black">
                          Serial Number
                        </Label>
                        <Input
                          id={`serialNumber-${index}`}
                          value={product.serialNumber}
                          onChange={(e) => updateProduct(index, 'serialNumber', e.target.value)}
                          placeholder="Enter serial number"
                          className={`${inputClasses} bg-white`}
                        />
                      </div>
                    </div>

                    {/* Second Row - Brand and Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor={`brand-${index}`} className="text-sm font-medium text-black">
                          Brand
                        </Label>
                        <Input
                          id={`brand-${index}`}
                          value={product.brand}
                          onChange={(e) => updateProduct(index, 'brand', e.target.value)}
                          placeholder="Enter brand"
                          className={`${inputClasses} bg-white ${
                            validationErrors.productDetails?.[index]?.brand ? errorInputClasses : ''
                          }`}
                          required
                        />
                        {validationErrors.productDetails?.[index]?.brand && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>{validationErrors.productDetails[index].brand}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor={`type-${index}`} className="text-sm font-medium text-black">
                          Type
                        </Label>
                        <Input
                          id={`type-${index}`}
                          value={product.type}
                          onChange={(e) => updateProduct(index, 'type', e.target.value)}
                          placeholder="Enter product type"
                          className={`${inputClasses} bg-white ${
                            validationErrors.productDetails?.[index]?.type ? errorInputClasses : ''
                          }`}
                          required
                        />
                        {validationErrors.productDetails?.[index]?.type && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>{validationErrors.productDetails[index].type}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Third Row - Product Issue (Full Width) */}
                    <div className="space-y-3">
                      <Label htmlFor={`issue-${index}`} className="text-sm font-medium text-black">
                        Product Issue
                      </Label>
                      <Textarea
                        id={`issue-${index}`}
                        value={product.productIssue}
                        onChange={(e) => updateProduct(index, 'productIssue', e.target.value)}
                        placeholder="Describe the issue"
                        className={`min-h-[120px] w-full px-3 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white ${
                          validationErrors.productDetails?.[index]?.productIssue ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                        required
                      />
                      {validationErrors.productDetails?.[index]?.productIssue && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{validationErrors.productDetails[index].productIssue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add Product Button */}
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={addProduct}
                    className="text-amber-700 hover:bg-amber-50 flex items-center gap-2 border-none"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

function EditServiceFormSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
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
        </div>
      </div>
    </div>
  );
}