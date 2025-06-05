'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Pencil, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStaffMember } from '@/hooks/useStaff';
import { SkeletonForm } from '@/components/ui/skeleton-form';
import { useState } from 'react';

interface StaffViewProps {
  staffId: string;
}

export default function StaffView({ staffId }: StaffViewProps) {
  const router = useRouter();
  const { data: staff, isLoading } = useStaffMember(staffId);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const handleEditClick = async () => {
    setIsEditLoading(true);
    router.push(`/staff/edit/${staffId}`);
  };

  if (isLoading) {
    return <SkeletonForm />;
  }

  if (!staff) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-black mb-2">Staff member not found</h2>
        <p className="text-gray-600 mb-4">The staff member you&apos;re trying to view doesn&apos;t exist.</p>
        <Link href="/staff">
          <Button className="bg-[#925D00] hover:bg-[#7A4D00] text-white">
            Back to Staff List
          </Button>
        </Link>
      </div>
    );
  }

  const inputClasses = "h-11 w-full px-3 border border-gray-300 rounded-md text-gray-900 bg-gray-50 cursor-not-allowed";

  return (
    <div className="min-h-screen">
      {/* Header with buttons */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link href="/staff" className="text-gray-600 hover:text-gray-900 transition-colors">
              Staff
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-amber-700 font-medium">Staff Details</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleEditClick}
              className="bg-[#925D00] hover:bg-[#7A4D00] text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 min-w-[80px] disabled:opacity-50"
              disabled={isEditLoading}
            >
              {isEditLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Staff Details Card */}
          <Card className="shadow-sm border-gray-200 overflow-hidden bg-transparent rounded-none">
            <CardHeader className="py-6 bg-[#EFEAE3]">
              <CardTitle className="text-lg text-center text-black font-medium">Staff Details</CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-transparent">
              <div className="space-y-8">
                {/* First Row - Full Name and Contact Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-black">
                      Full name
                    </Label>
                    <Input
                      value={staff.staffName}
                      className={inputClasses}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-black">
                      Contact number
                    </Label>
                    <Input
                      value={staff.contactNumber}
                      className={inputClasses}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Second Row - Role and Branch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-black">
                      Role
                    </Label>
                    <Input
                      value={staff.role}
                      className={inputClasses}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-black">
                      Branch
                    </Label>
                    <Input
                      value={typeof staff.branch === 'object' ? staff.branch.branchName : staff.branch}
                      className={inputClasses}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Third Row - Address */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-black">
                    Address
                  </Label>
                  <Textarea
                    value={staff.address}
                    className={`min-h-[120px] w-full px-3 border border-gray-300 rounded-md text-gray-900 bg-gray-50 resize-none cursor-not-allowed`}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}