'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 text-sm sm:text-base mt-1">View and manage customer information</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, phone, or customer ID..."
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardContent className="p-0">
          {/* Table Header - Desktop */}
          <div className="hidden md:grid bg-red-600 text-white px-6 py-3 grid-cols-6 gap-4 text-sm font-medium rounded-t-lg">
            <div>Customer ID</div>
            <div>Name</div>
            <div>Phone</div>
            <div>Service ID</div>
            <div>Status</div>
            <div>Created Date</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {displayCustomers.map((customer) => (
              <div key={customer._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{customer.customerName}</div>
                      <div className="text-sm text-gray-500 break-all">{customer.phone}</div>
                    </div>
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
                  <div className="text-sm text-gray-600">
                    <div>Customer ID: <span className="font-mono">{customer.customerId}</span></div>
                    <div>Service ID: <span className="font-mono">{customer.serviceId.serviceId}</span></div>
                    <div>Location: {customer.location}</div>
                    <div>Created: {formatDate(customer.createdAt)}</div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid grid-cols-6 gap-4 items-center">
                  <div className="font-medium text-gray-900 font-mono text-sm break-all">
                    {customer.customerId}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{customer.customerName}</div>
                    <div className="text-sm text-gray-500">{customer.location}</div>
                  </div>
                  <div className="text-gray-900 break-all">{customer.phone}</div>
                  <div>
                    <div className="font-medium text-gray-900 font-mono text-sm">
                      {customer.serviceId.serviceId}
                    </div>
                    <div className="text-sm text-gray-500">{customer.serviceId.action}</div>
                  </div>
                  <div>
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
                  <div className="text-sm text-gray-500">{formatDate(customer.createdAt)}</div>
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
        </CardContent>
      </Card>
    </div>
  );
}