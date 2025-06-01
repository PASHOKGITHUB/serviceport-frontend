'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { 
  Package, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Plus,
  Eye,
  DollarSign,
  Calendar,
  CalendarDays,
  CalendarRange
} from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useTechnicians } from '@/hooks/useStaff';
import { getStatusColor, formatDate } from '@/lib/utils';
import type { Service } from '@/domain/entities/service';

export default function DashboardContent() {
  const { data: servicesResponse, isLoading: servicesLoading } = useServices();
  const { data: techniciansResponse, isLoading: techLoading } = useTechnicians();
  
  // Safely extract data from API responses
  const services: Service[] = servicesResponse?.data?.services || [];
  const technicians = techniciansResponse || [];

  // Calculate statistics
  const totalServices = services.length;
  const pendingServices = services.filter(service => 
    ['Received', 'Under Inspection', 'Waiting for Customer Approval'].includes(service.action)
  ).length;
  const inProgressServices = services.filter(service => 
    ['Assigned to Technician', 'Approved', 'In Service'].includes(service.action)
  ).length;
  const completedServices = services.filter(service => 
    service.action === 'Completed'
  ).length;

  // Revenue calculations
  const calculateRevenue = (period: 'today' | 'week' | 'month') => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let filterDate: Date;
    switch (period) {
      case 'today':
        filterDate = startOfToday;
        break;
      case 'week':
        filterDate = startOfWeek;
        break;
      case 'month':
        filterDate = startOfMonth;
        break;
    }

    const filteredServices = services.filter(service => {
      // Only count completed services with service cost
      if (service.action !== 'Completed' || !service.serviceCost) return false;
      
      // Use deliveredDate if available, otherwise use updatedAt
      const serviceDate = service.deliveredDate ? new Date(service.deliveredDate) : new Date(service.updatedAt);
      return serviceDate >= filterDate;
    });

    const totalRevenue = filteredServices.reduce((sum, service) => sum + (service.serviceCost || 0), 0);
    const serviceCount = filteredServices.length;

    return { totalRevenue, serviceCount };
  };

  const todayRevenue = calculateRevenue('today');
  const weeklyRevenue = calculateRevenue('week');
  const monthlyRevenue = calculateRevenue('month');

  // Total all-time revenue
  const totalRevenue = services
    .filter(service => service.action === 'Completed' && service.serviceCost)
    .reduce((sum, service) => sum + (service.serviceCost || 0), 0);

  // Recent services (last 5)
  const recentServices = services
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (servicesLoading || techLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <Link href="/services/create">
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            New Service
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">All time services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingServices}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressServices}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Services */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Services</CardTitle>
              <Link href="/services">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No services found</p>
                <Link href="/services/create">
                  <Button className="mt-4 bg-red-600 hover:bg-red-700">
                    Create First Service
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentServices.map((service) => (
                  <div key={service._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-gray-900 font-mono text-sm">
                          {service.serviceId}
                        </div>
                        <Badge className={getStatusColor(service.action)}>
                          {service.action}
                        </Badge>
                        {service.serviceCost && (
                          <span className="text-sm font-medium text-green-600">
                            ₹{service.serviceCost}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {service.customerName} • {service.location}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(service.createdAt)}
                      </div>
                    </div>
                    <Link href={`/services/view/${service._id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats with Revenue Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Stats & Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Revenue Overview with Tabs */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Revenue Overview</h4>
              <Tabs defaultValue="today" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="today" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Today
                  </TabsTrigger>
                  <TabsTrigger value="week" className="text-xs">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="month" className="text-xs">
                    <CalendarRange className="h-3 w-3 mr-1" />
                    Month
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="today" className="mt-3">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      ₹{todayRevenue.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">
                      {todayRevenue.serviceCount} completed services today
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="week" className="mt-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">
                      ₹{weeklyRevenue.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600">
                      {weeklyRevenue.serviceCount} completed services this week
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="month" className="mt-3">
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">
                      ₹{monthlyRevenue.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-600">
                      {monthlyRevenue.serviceCount} completed services this month
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Divider */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">General Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Technicians</span>
                  <span className="font-medium">{technicians.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-medium text-green-600">
                    {totalServices > 0 ? Math.round((completedServices / totalServices) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Services</span>
                  <span className="font-medium text-blue-600">
                    {totalServices - completedServices}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Service Value</span>
                  <span className="font-medium text-green-600">
                    ₹{completedServices > 0 ? Math.round(totalRevenue / completedServices).toLocaleString() : 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Link href="/services">
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Detailed Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}