'use client';

// import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronRight, Edit } from 'lucide-react';
import Link from 'next/link';
import { useBranch } from '@/hooks/useBranches';
import { SkeletonForm } from '@/components/ui/skeleton-form';

interface BranchViewFormProps {
  branchId: string;
}

export default function BranchViewForm({ branchId }: BranchViewFormProps) {
//   const router = useRouter();
  const { data: branch, isLoading } = useBranch(branchId);

  const inputClasses = "h-11 w-full px-3 border border-gray-300 rounded-md text-gray-900 bg-gray-50 cursor-not-allowed";

  if (isLoading) {
    return <SkeletonForm />;
  }

  if (!branch) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-black mb-2">Branch not found</h2>
        <p className="text-gray-600 mb-4">The branch you&apos;re trying to view doesn&apos;t exist.</p>
        <Link href="/branches">
          <Button className="bg-amber-700 hover:bg-amber-800 text-white">
            Back to Branches
          </Button>
        </Link>
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
            <Link href="/branches" className="text-gray-600 hover:text-gray-900 transition-colors">
              Branches
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-amber-700 font-medium">View Branch Details</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Link href={`/branches/edit/${branchId}`}>
              <Button 
                className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Link href="/branches">
              <Button 
                type="button" 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium"
              >
                Back
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Branch Details Card */}
        <Card className="shadow-sm border-gray-200 overflow-hidden bg-transparent rounded-none">
          <CardHeader className="py-6 bg-[#EFEAE3]">
            <CardTitle className="text-lg text-center text-black font-medium">Branch Details</CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-transparent">
            <div className="space-y-8">
              {/* First Row - Branch Name and Contact Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="branchName" className="text-sm font-medium text-black">
                    Branch Name
                  </Label>
                  <input
                    id="branchName"
                    value={branch.branchName || ''}
                    readOnly
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="contactNumber" className="text-sm font-medium text-black">
                    Contact Number
                  </Label>
                  <input
                    id="contactNumber"
                    value={branch.phoneNumber || ''}
                    readOnly
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Second Row - Location */}
              <div className="space-y-3">
                <Label htmlFor="location" className="text-sm font-medium text-black">
                  Location
                </Label>
                <input
                  id="location"
                  value={branch.location || ''}
                  readOnly
                  className={inputClasses}
                />
              </div>

              {/* Third Row - Status */}
              <div className="space-y-3">
                <Label htmlFor="status" className="text-sm font-medium text-black">
                  Status
                </Label>
                <input
                  id="status"
                  value={branch.status}
                  readOnly
                  className={inputClasses}
                />
              </div>

              {/* Fourth Row - Address (Full Width) */}
              <div className="space-y-3">
                <Label htmlFor="address" className="text-sm font-medium text-black">
                  Address
                </Label>
                <textarea
                  id="address"
                  value={branch.address || 'No address provided'}
                  readOnly
                  className={`min-h-[120px] w-full px-3 border border-gray-300 rounded-md text-gray-900 bg-gray-50 cursor-not-allowed resize-none`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}