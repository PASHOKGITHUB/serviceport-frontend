// 'use client';

// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Edit, ArrowLeft } from 'lucide-react';
// import Link from 'next/link';
// import { useService, useUpdateServiceAction, useAssignTechnician } from '@/hooks/useServices';
// import { useTechnicians } from '@/hooks/useStaff';
// import { getStatusColor, formatDate } from '@/lib/utils';
// import type { ServiceAction } from '@/domain/entities/service';

// interface ServiceDetailsProps {
//   serviceId: string;
// }

// const statusOptions: ServiceAction[] = [
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

// export default function ServiceDetails({ serviceId }: ServiceDetailsProps) {
//   const { data: service, isLoading } = useService(serviceId);
//   const { data: technicians = [] } = useTechnicians();
//   const updateActionMutation = useUpdateServiceAction();
//   const assignTechnicianMutation = useAssignTechnician();

//   const handleStatusChange = async (newStatus: ServiceAction) => {
//     if (!service) return;
    
//     try {
//       await updateActionMutation.mutateAsync({ id: service._id, action: newStatus });
//     } catch (err) {
//       console.error('Error updating service status:', err);}
//   };

//   const handleTechnicianChange = async (technicianId: string) => {
//     if (!service) return;
    
//     try {
//       await assignTechnicianMutation.mutateAsync({ id: service._id, technicianId });
//     } catch (err) 
//     {
//         console.error('Error assigning technician:', err);

//       // Error is handled in the mutation
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
//         <div className="flex items-center gap-4">
//           <Skeleton className="h-10 w-20" />
//           <Skeleton className="h-8 w-48" />
//         </div>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
//           <div className="lg:col-span-2 space-y-4 sm:space-y-6">
//             <Skeleton className="h-64 w-full" />
//             <Skeleton className="h-64 w-full" />
//           </div>
//           <div className="space-y-4 sm:space-y-6">
//             <Skeleton className="h-48 w-full" />
//             <Skeleton className="h-48 w-full" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!service) {
//     return (
//       <div className="text-center py-12 px-4">
//         <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Service not found</h2>
//         <p className="text-gray-600 mb-4">The service you&apos;re looking for doesn&apos;t exist.</p>
//         <Link href="/services">
//           <Button className="bg-red-600 hover:bg-red-700">
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Services
//           </Button>
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
//           <Link href="/services">
//             <Button variant="outline" size="sm" className="mb-2 sm:mb-0">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back
//             </Button>
//           </Link>
//           <div className="min-w-0 flex-1">
//             <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
//               Service Details
//             </h1>
//             <p className="text-gray-600 text-sm sm:text-base break-all">
//               Service ID: {service.serviceId}
//             </p>
//           </div>
//         </div>
//         <Button variant="outline" className="w-full sm:w-auto">
//           <Edit className="h-4 w-4 mr-2" />
//           Edit Service
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
//         {/* Main Details */}
//         <div className="lg:col-span-2 space-y-4 sm:space-y-6">
//           {/* Customer Information */}
//           <Card className="hover:shadow-sm transition-shadow">
//             <CardHeader>
//               <CardTitle className="text-lg sm:text-xl">Customer Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium text-gray-500">Customer Name</p>
//                   <p className="text-gray-900 break-words">{service.customerName}</p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium text-gray-500">Contact Number</p>
//                   <p className="text-gray-900 break-all">{service.customerContactNumber}</p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium text-gray-500">Location</p>
//                   <p className="text-gray-900 break-words">{service.location}</p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium text-gray-500">Address</p>
//                   <p className="text-gray-900 break-words">{service.address}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Product Details */}
//           <Card className="hover:shadow-sm transition-shadow">
//             <CardHeader>
//               <CardTitle className="text-lg sm:text-xl">Product Details</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {service.productDetails.map((product, index) => (
//                   <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
//                     <h3 className="font-medium mb-3 text-gray-900">Product {index + 1}</h3>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <div className="space-y-1">
//                         <p className="text-sm font-medium text-gray-500">Product Name</p>
//                         <p className="text-gray-900 break-words">{product.productName}</p>
//                       </div>
//                       <div className="space-y-1">
//                         <p className="text-sm font-medium text-gray-500">Brand</p>
//                         <p className="text-gray-900 break-words">{product.brand}</p>
//                       </div>
//                       <div className="space-y-1">
//                         <p className="text-sm font-medium text-gray-500">Type</p>
//                         <p className="text-gray-900 break-words">{product.type}</p>
//                       </div>
//                       <div className="space-y-1">
//                         <p className="text-sm font-medium text-gray-500">Serial Number</p>
//                         <p className="text-gray-900 break-all">{product.serialNumber || 'N/A'}</p>
//                       </div>
//                       <div className="sm:col-span-2 space-y-1">
//                         <p className="text-sm font-medium text-gray-500">Issue Description</p>
//                         <p className="text-gray-900 break-words">{product.productIssue}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-4 sm:space-y-6">
//           {/* Service Status */}
//           <Card className="hover:shadow-sm transition-shadow">
//             <CardHeader>
//               <CardTitle className="text-lg sm:text-xl">Service Status</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700">Update Status</label>
//                 <Select 
//                   value={service.action}
//                   onValueChange={handleStatusChange}
//                   disabled={updateActionMutation.isPending}
//                 >
//                   <SelectTrigger className="h-10">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {statusOptions.map((status) => (
//                       <SelectItem key={status} value={status}>
//                         {status}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
              
//               <div className="space-y-1">
//                 <p className="text-sm font-medium text-gray-500">Current Status</p>
//                 <Badge className={`${getStatusColor(service.action)} inline-flex`}>
//                   {service.action}
//                 </Badge>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Technician Assignment */}
//           <Card className="hover:shadow-sm transition-shadow">
//             <CardHeader>
//               <CardTitle className="text-lg sm:text-xl">Technician Assignment</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700">Assign Technician</label>
//                 <Select 
//                   value={service.technician?._id || ""}
//                   onValueChange={handleTechnicianChange}
//                   disabled={assignTechnicianMutation.isPending}
//                 >
//                   <SelectTrigger className="h-10">
//                     <SelectValue placeholder="Select Technician" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {technicians.map((tech) => (
//                       <SelectItem key={tech._id} value={tech._id}>
//                         {tech.staffName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
              
//               {service.technician && (
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium text-gray-500">Current Technician</p>
//                   <div>
//                     <p className="text-gray-900 break-words">{service.technician.staffName}</p>
//                     <p className="text-sm text-gray-600 break-all">{service.technician.contactNumber}</p>
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Service Information */}
//           <Card className="hover:shadow-sm transition-shadow">
//             <CardHeader>
//               <CardTitle className="text-lg sm:text-xl">Service Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium text-gray-500">Service ID</p>
//                 <p className="text-gray-900 break-all font-mono text-sm">{service.serviceId}</p>
//               </div>
//               <div className="space-y-1">
//                 <p className="text-sm font-medium text-gray-500">Received Date</p>
//                 <p className="text-gray-900">{formatDate(service.receivedDate)}</p>
//               </div>
//               {service.deliveredDate && (
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium text-gray-500">Delivered Date</p>
//                   <p className="text-gray-900">{formatDate(service.deliveredDate)}</p>
//                 </div>
//               )}
//               {service.serviceCost && (
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium text-gray-500">Service Cost</p>
//                   <p className="text-gray-900 font-medium">₹{service.serviceCost.toLocaleString()}</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }