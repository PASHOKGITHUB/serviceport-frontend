'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { useCustomers, useSearchCustomers } from '@/hooks/useCustomers';
import { formatDate } from '@/lib/utils';

export default function CustomersList() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: customers = [], isLoading } = useCustomers();
  const { data: searchResults = [] } = useSearchCustomers(searchQuery);

  const displayCustomers = searchQuery ? searchResults : customers;

  if (isLoading) {
    return <CustomersListSkeleton />;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Customers</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {displayCustomers.length} total customers
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center">
          {/* Search Bar - Left Side */}
          <div className="flex-1 lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, phone, or customer ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Desktop Table Header */}
        <div className="hidden md:grid bg-amber-600 text-white px-6 py-4 text-sm font-medium" style={{gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr 1fr 1fr", gap: "1rem"}}>
          <div className="text-center">Customer ID</div>
          <div className="text-center">Name</div>
          <div className="text-center">Phone</div>
          <div className="text-center">Service ID</div>
          <div className="text-center">Status</div>
          <div className="text-center">Created Date</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {displayCustomers.map((customer) => (
            <div key={customer._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              {/* Mobile Layout */}
              <div className="md:hidden space-y-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 break-words">{customer.customerName}</div>
                    <div className="text-sm text-gray-500 break-all">{customer.phone}</div>
                    <div className="text-sm text-gray-500 break-words">{customer.location}</div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={`${
                      customer.serviceStatus === 'Completed' 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : customer.serviceStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {customer.serviceStatus}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Customer ID: </span>
                    <span className="text-sm text-gray-900 font-mono break-all">{customer.customerId}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Service ID: </span>
                    <span className="text-sm text-gray-900 font-mono break-all">{customer.serviceId.serviceId}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Action: </span>
                    <span className="text-sm text-gray-900">{customer.serviceId.action}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created: </span>
                    <span className="text-sm text-gray-900">{formatDate(customer.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Layout - Properly Centered */}
              <div className="hidden md:grid items-center transition-colors" style={{gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr 1fr 1fr", gap: "1rem"}}>
                <div className="font-medium text-gray-900 font-mono text-sm break-all flex justify-center">
                  {customer.customerId}
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="font-medium text-gray-900 break-words">{customer.customerName}</div>
                  <div className="text-sm text-gray-500 break-words">{customer.location}</div>
                </div>
                <div className="text-gray-900 break-all flex justify-center items-center">{customer.phone}</div>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="font-medium text-gray-900 font-mono text-sm break-all">
                    {customer.serviceId.serviceId}
                  </div>
                  <div className="text-sm text-gray-500">{customer.serviceId.action}</div>
                </div>
                <div className="flex justify-center items-center">
                  <Badge className={`${
                    customer.serviceStatus === 'Completed' 
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : customer.serviceStatus === 'Cancelled'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {customer.serviceStatus}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 flex justify-center items-center">{formatDate(customer.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>

        {displayCustomers.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500">
              {searchQuery ? 'No customers found matching your search.' : 'No customers found.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomersListSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
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