'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';
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
    }
  };

  const updateProduct = (index: number, field: keyof ProductDetails, value: string) => {
    const newProducts = [...formData.productDetails];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setFormData({ ...formData, productDetails: newProducts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.branchId) {
      return;
    }

    try {
      await createServiceMutation.mutateAsync(formData);
      router.push('/services');
    } catch (err) {

      console.error('Error creating service:', err);}
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

        {/* Branch Selection */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Branch Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full sm:max-w-xs">
              <Label htmlFor="branch" className="text-sm font-medium">Branch *</Label>
              <Select value={formData.branchId} onValueChange={(value) => setFormData({ ...formData, branchId: value })}>
                <SelectTrigger className="mt-2 h-10">
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
      </form>
    </div>
  );
}