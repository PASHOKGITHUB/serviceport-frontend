'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MessageCircle, ChevronDown } from 'lucide-react';
import { useCustomers, useSearchCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';

export default function CustomersList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  
  const { data: customers = [], isLoading } = useCustomers();
  const { data: searchResults = [] } = useSearchCustomers(searchQuery);
  const { data: branches = [], isLoading: branchesLoading } = useBranches();

  const displayCustomers = searchQuery ? searchResults : customers;

  // Get unique actions for filter tabs
  const filterOptions = useMemo(() => {
    const actions = [...new Set(customers.map(customer => customer.serviceId?.action).filter(Boolean))];
    return ['All', ...actions];
  }, [customers]);

  // Filter customers by active filter and selected branch
  const filteredCustomers = useMemo(() => {
    return displayCustomers.filter(customer => {
      const matchesAction = activeFilter === 'All' || customer.serviceId?.action === activeFilter;
      const matchesBranch = selectedBranch === 'All Branches' || customer.branchId?.branchName === selectedBranch;
      return matchesAction && matchesBranch;
    });
  }, [displayCustomers, activeFilter, selectedBranch]);

  // Group customers by date
  const customersByDate = useMemo(() => {
    const grouped = filteredCustomers.reduce((acc, customer) => {
      const date = new Date(customer.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(customer);
      return acc;
    }, {} as Record<string, typeof filteredCustomers>);

    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(grouped).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedDates.map(date => ({
      date,
      customers: grouped[date]
    }));
  }, [filteredCustomers]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      case 'checking':
        return 'text-blue-600';
      case 'waiting':
        return 'text-yellow-600';
      case 'approved':
        return 'text-purple-600';
      case 'finished':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading || branchesLoading) {
    return <CustomersListSkeleton />;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">Customers</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {filteredCustomers.length} total customers
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
                  onClick={() => setSelectedBranch('All Branches')}
                  className={selectedBranch === 'All Branches' ? 'bg-gray-100' : ''}
                >
                  All Branches
                </DropdownMenuItem>
                {branches.map((branch) => (
                  <DropdownMenuItem 
                    key={branch._id}
                    onClick={() => setSelectedBranch(branch.branchName)}
                    className={selectedBranch === branch.branchName ? 'bg-gray-100' : ''}
                  >
                    {branch.branchName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Updated to match staff list style */}
      <div className="flex gap-6">
        {filterOptions.map((option) => {
          // Fix count calculation - count from displayCustomers with branch filter applied
          const customerCount = option === 'All' 
            ? displayCustomers.filter(customer => 
                selectedBranch === 'All Branches' || customer.branchId?.branchName === selectedBranch
              ).length
            : displayCustomers.filter(customer => {
                const matchesAction = customer.serviceId?.action === option;
                const matchesBranch = selectedBranch === 'All Branches' || customer.branchId?.branchName === selectedBranch;
                return matchesAction && matchesBranch;
              }).length;
          
          return (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-2 py-2 text-sm font-medium transition-all relative ${
                activeFilter === option
                  ? 'text-[#C5AA7E]'
                  : 'text-gray-600 hover:text-[#C5AA7E]'
              }`}
            >
              {option}({customerCount})
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

      {/* Search Section - Removed white background */}
      <div className="flex items-center">
        <div className="flex-1 lg:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Service ID, Customer Name, Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Customers Table with Date Sections */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Desktop Table Header */}
        <div 
          className="hidden md:grid text-white px-6 py-4 text-sm font-medium" 
          style={{
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr 2fr", 
            gap: "1rem",
            backgroundColor: '#C5AA7E'
          }}
        >
          <div className="text-center">Customer Name</div>
          <div className="text-center">Phone</div>
          <div className="text-center">Location</div>
          <div className="text-center">Service ID</div>
          <div className="text-center">Address</div>
        </div>

        {/* Date-wise Customer Sections */}
        <div className="divide-y divide-gray-200">
          {customersByDate.map(({ date, customers: dateCustomers }) => (
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

              {/* Customers for this date */}
              <div className="divide-y divide-gray-100">
                {dateCustomers.map((customer) => (
                  <div key={customer._id} className="hover:bg-gray-50 transition-colors">
                    {/* Mobile Layout - Removed Link and onClick */}
                    <div className="md:hidden p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 break-words">
                            {customer.customerName}
                          </div>
                          <div className="text-sm text-gray-500 break-all">{customer.phone}</div>
                          <div className="text-sm text-gray-500 break-words">{customer.location}</div>
                          <div className="text-sm text-gray-500 font-mono">{customer.serviceId?.serviceId}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getStatusColor(customer.serviceId?.action)}`}>
                            {customer.serviceId?.action}
                          </span>
                          <MessageCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 border border-gray-300 bg-gray-50 p-2 rounded">
                        {customer.address}
                      </div>
                    </div>

                    {/* Desktop Layout - Removed Link and onClick */}
                    <div 
                      className="hidden md:grid items-center hover:bg-gray-100 px-6 py-4" 
                      style={{gridTemplateColumns: "1.5fr 1fr 1fr 1fr 2fr", gap: "1rem"}}
                    >
                      <div className="flex justify-center items-center">
                        <div className="font-medium text-gray-900 break-words text-center">
                          {customer.customerName}
                        </div>
                      </div>
                      <div className="text-gray-900 break-all flex justify-center items-center">
                        {customer.phone}
                      </div>
                      <div className="text-gray-900 break-words flex justify-center items-center text-center">
                        {customer.location}
                      </div>
                      <div className="flex justify-center items-center">
                        <div className="text-center">
                          <div className="font-mono text-sm text-gray-900">{customer.serviceId?.serviceId}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-500 text-sm break-words flex-1 pr-2 border border-gray-300 bg-gray-50 p-2 rounded">
                          {customer.address}
                        </div>
                        <MessageCircle className="h-4 w-4 text-green-500 flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500">
              {searchQuery 
                ? 'No customers found matching your search.' 
                : activeFilter !== 'All' 
                ? `No customers found with ${activeFilter} status.`
                : 'No customers found.'
              }
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