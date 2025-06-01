'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronRight, Plus, Trash2, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useCreateService } from '@/hooks/useServices';
import { useBranches } from '@/hooks/useBranches';
import type { CreateServiceRequest, ProductDetails } from '@/domain/entities/service';

export default function CreateServiceForm() {
  const router = useRouter();
  const { data: branches = [] } = useBranches();
  const createServiceMutation = useCreateService();

  const [formData, setFormData] = useState<CreateServiceRequest>({
    customerName: '',
    customerContactNumber: '',
    address: '',
    location: '',
    productDetails: [
      { productName: '', serialNumber: '', brand: '', type: '', productIssue: '' }
    ],
    branchId: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Branch validation
    if (!formData.branchId) {
      newErrors.branchId = 'Please select a branch';
    }

    // Customer details validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerContactNumber.trim()) {
      newErrors.customerContactNumber = 'Contact number is required';
    } else if (formData.customerContactNumber.length < 10) {
      newErrors.customerContactNumber = 'Contact number must be at least 10 digits';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Product details validation
    formData.productDetails.forEach((product, index) => {
      if (!product.productName.trim()) {
        newErrors[`product-${index}-productName`] = 'Product name is required';
      }
      if (!product.brand.trim()) {
        newErrors[`product-${index}-brand`] = 'Brand is required';
      }
      if (!product.type.trim()) {
        newErrors[`product-${index}-type`] = 'Product type is required';
      }
      if (!product.productIssue.trim()) {
        newErrors[`product-${index}-productIssue`] = 'Product issue description is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      productDetails: [
        ...formData.productDetails,
        { productName: '', serialNumber: '', brand: '', type: '', productIssue: '' }
      ]
    });
  };

  const removeProduct = (index: number) => {
    if (formData.productDetails.length > 1) {
      const newProducts = formData.productDetails.filter((_, i) => i !== index);
      setFormData({ ...formData, productDetails: newProducts });
      
      // Clear errors for removed product
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`product-${index}-`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  const updateProduct = (index: number, field: keyof ProductDetails, value: string) => {
    const newProducts = [...formData.productDetails];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setFormData({ ...formData, productDetails: newProducts });

    // Clear specific field error when user starts typing
    const errorKey = `product-${index}-${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleFieldChange = (field: keyof CreateServiceRequest, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear field error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const getSelectedBranch = () => {
    return branches.find(branch => branch._id === formData.branchId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createServiceMutation.mutateAsync(formData);
      // Direct redirect without success dialog
      router.push('/services');
      
    } catch (err: any) {
      console.error('Error creating service:', err);
      
      // Handle specific API errors
      if (err?.response?.data?.message) {
        setErrors({ submit: err.response.data.message });
      } else {
        setErrors({ submit: 'Failed to create service. Please try again.' });
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/services" className="text-gray-600 hover:text-gray-900 transition-colors">
          Services
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-red-600 font-medium">Create Service</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Service</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 transition-colors order-2 sm:order-1"
              disabled={createServiceMutation.isPending}
            >
              {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
            </Button>
            <Link href="/services" className="order-1 sm:order-2">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {errors.submit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        {/* Branch Selection */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Branch Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full sm:max-w-xs">
                <Label htmlFor="branch" className="text-sm font-medium">Branch *</Label>
                <Select 
                  value={formData.branchId} 
                  onValueChange={(value) => handleFieldChange('branchId', value)}
                >
                  <SelectTrigger className={`mt-2 h-10 ${errors.branchId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{branch.branchName}</span>
                          <span className="text-sm text-gray-500">{branch.location}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.branchId && (
                  <p className="text-sm text-red-600 mt-1">{errors.branchId}</p>
                )}
              </div>

              {/* Selected Branch Display */}
              {formData.branchId && getSelectedBranch() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-800">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Selected Branch:</span>
                  </div>
                  <div className="mt-1">
                    <p className="font-semibold text-blue-900">{getSelectedBranch()?.branchName}</p>
                    <p className="text-sm text-blue-700">{getSelectedBranch()?.location}</p>
                    {getSelectedBranch()?.address && (
                      <p className="text-sm text-blue-600">{getSelectedBranch()?.address}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                  onChange={(e) => handleFieldChange('customerName', e.target.value)}
                  placeholder="Enter customer name"
                  className={`h-10 ${errors.customerName ? 'border-red-500' : ''}`}
                  required
                />
                {errors.customerName && (
                  <p className="text-sm text-red-600">{errors.customerName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerContact" className="text-sm font-medium">Contact Number *</Label>
                <Input
                  id="customerContact"
                  value={formData.customerContactNumber}
                  onChange={(e) => handleFieldChange('customerContactNumber', e.target.value)}
                  placeholder="Enter contact number"
                  className={`h-10 ${errors.customerContactNumber ? 'border-red-500' : ''}`}
                  required
                />
                {errors.customerContactNumber && (
                  <p className="text-sm text-red-600">{errors.customerContactNumber}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  placeholder="Enter location"
                  className={`h-10 ${errors.location ? 'border-red-500' : ''}`}
                  required
                />
                {errors.location && (
                  <p className="text-sm text-red-600">{errors.location}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Enter full address"
                  className={`min-h-[80px] resize-none ${errors.address ? 'border-red-500' : ''}`}
                  required
                />
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address}</p>
                )}
              </div>
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
            {formData.productDetails.map((product, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">Product {index + 1}</h3>
                  {formData.productDetails.length > 1 && (
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
                      className={`h-10 ${errors[`product-${index}-productName`] ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors[`product-${index}-productName`] && (
                      <p className="text-sm text-red-600">{errors[`product-${index}-productName`]}</p>
                    )}
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
                      className={`h-10 ${errors[`product-${index}-brand`] ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors[`product-${index}-brand`] && (
                      <p className="text-sm text-red-600">{errors[`product-${index}-brand`]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`type-${index}`} className="text-sm font-medium">Type *</Label>
                    <Input
                      id={`type-${index}`}
                      value={product.type}
                      onChange={(e) => updateProduct(index, 'type', e.target.value)}
                      placeholder="Enter product type"
                      className={`h-10 ${errors[`product-${index}-type`] ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors[`product-${index}-type`] && (
                      <p className="text-sm text-red-600">{errors[`product-${index}-type`]}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`issue-${index}`} className="text-sm font-medium">Product Issue *</Label>
                  <Textarea
                    id={`issue-${index}`}
                    value={product.productIssue}
                    onChange={(e) => updateProduct(index, 'productIssue', e.target.value)}
                    placeholder="Describe the issue"
                    className={`min-h-[80px] resize-none ${errors[`product-${index}-productIssue`] ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors[`product-${index}-productIssue`] && (
                    <p className="text-sm text-red-600">{errors[`product-${index}-productIssue`]}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}