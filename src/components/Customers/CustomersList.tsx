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
import { 
  Search, 
  MessageCircle, 
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCustomers, useSearchCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
// import { Customer } from '@/domain/entities/customer';

// Define all possible customer service statuses/actions
const ACTION_OPTIONS = [
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

export default function CustomersList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;
  
  const { data: customers = [], isLoading } = useCustomers();
  const { data: searchResults = [] } = useSearchCustomers(searchQuery);
  const { data: branches = [], isLoading: branchesLoading } = useBranches();

  // Frontend search logic as fallback
  const searchCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return customers;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return customers.filter(customer => {
      const customerName = customer.customerName?.toLowerCase() || '';
      const phone = customer.phone?.toLowerCase() || '';
      const serviceId = customer.serviceId?.serviceId?.toLowerCase() || '';
      const location = customer.location?.toLowerCase() || '';
      const address = customer.address?.toLowerCase() || '';
      
      return (
        customerName.includes(query) ||
        phone.includes(query) ||
        serviceId.includes(query) ||
        location.includes(query) ||
        address.includes(query)
      );
    });
  }, [customers, searchQuery]);

  // Use API search results if available and not empty, otherwise use frontend search
  const baseCustomers = useMemo(() => {
    if (searchQuery.trim()) {
      // Try API search first, fallback to frontend search if API returns empty or fails
      if (searchResults && searchResults.length > 0) {
        return searchResults;
      } else {
        return searchCustomers;
      }
    }
    return customers;
  }, [searchQuery, searchResults, searchCustomers, customers]);

  // Apply filters to get display customers
  const displayCustomers = useMemo(() => {
    let filtered = baseCustomers;
    
    // Apply action filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(customer => customer.serviceId?.action === activeFilter);
    }
    
    // Apply branch filter
    if (selectedBranch !== 'All Branches') {
      filtered = filtered.filter(customer => 
        customer.branchId?.branchName === selectedBranch
      );
    }
    
    return filtered;
  }, [baseCustomers, activeFilter, selectedBranch]);

  // Get unique actions for filter tabs from all customers (not just filtered ones)
  const filterOptions = useMemo(() => {
    return ['All', ...ACTION_OPTIONS];
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(displayCustomers.length / customersPerPage);
  const currentCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * customersPerPage;
    const endIndex = startIndex + customersPerPage;
    return displayCustomers.slice(startIndex, endIndex);
  }, [displayCustomers, currentPage, customersPerPage]);

  // Group customers by date
  const customersByDate = useMemo(() => {
    const grouped = currentCustomers.reduce((acc, customer) => {
      const date = new Date(customer.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(customer);
      return acc;
    }, {} as Record<string, typeof currentCustomers>);

    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(grouped).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedDates.map(date => ({
      date,
      customers: grouped[date]
    }));
  }, [currentCustomers]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
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
              {displayCustomers.length} total customers
              {searchQuery && ` (filtered from ${customers.length})`}
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
                  onClick={() => {
                    setSelectedBranch('All Branches');
                    setCurrentPage(1);
                  }}
                  className={selectedBranch === 'All Branches' ? 'bg-gray-100' : ''}
                >
                  All Branches
                </DropdownMenuItem>
                {branches.map((branch) => (
                  <DropdownMenuItem 
                    key={branch._id}
                    onClick={() => {
                      setSelectedBranch(branch.branchName);
                      setCurrentPage(1);
                    }}
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

      {/* Filter Tabs */}
      <div className="flex gap-6 flex-wrap">
        {filterOptions.map((option) => {
          // Calculate count based on baseCustomers (search results or all customers) with branch filter applied
          let baseForCount = baseCustomers;
          
          // Apply branch filter for count calculation
          if (selectedBranch !== 'All Branches') {
            baseForCount = baseForCount.filter(customer => 
              customer.branchId?.branchName === selectedBranch
            );
          }
          
          // Calculate count for this specific filter option
          const customerCount = option === 'All' 
            ? baseForCount.length
            : baseForCount.filter(customer => customer.serviceId?.action === option).length;
          
          return (
            <button
              key={option}
              onClick={() => {
                setActiveFilter(option);
                setCurrentPage(1);
              }}
              className={`px-2 py-2 text-sm font-medium transition-all relative whitespace-nowrap ${
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

      {/* Search Section */}
      <div className="flex items-center gap-2">
        <div className="flex-1 lg:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Service ID, Customer Name, Phone, Location, Address"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 border-gray-300 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {/* {searchQuery && (
          <div className="text-sm text-gray-500">
            Found {displayCustomers.length} result{displayCustomers.length !== 1 ? 's' : ''}
          </div>
        )} */}
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
                    {/* Mobile Layout */}
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
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="text-sm text-gray-500 border border-gray-300 bg-gray-50 p-2 rounded flex-1">
                          {customer.address}
                        </div>
                        <MessageCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>

                    {/* Desktop Layout */}
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
                      <div className="flex justify-center items-center">
                        <div className="flex items-center gap-2 w-full justify-center">
                          <div className="text-gray-500 text-sm break-words border border-gray-300 bg-gray-50 p-2 rounded flex-1">
                            {customer.address}
                          </div>
                          <MessageCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {displayCustomers.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500 font-medium">
              {searchQuery 
                ? `No customers found matching "${searchQuery}".` 
                : activeFilter !== 'All' 
                ? `No customers found with ${activeFilter} status.`
                : 'No customers found.'
              }
            </div>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear search and view all customers
              </button>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {displayCustomers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * customersPerPage + 1, displayCustomers.length)} to{' '}
              {Math.min(currentPage * customersPerPage, displayCustomers.length)} of{' '}
              {displayCustomers.length} customers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-gray-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
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