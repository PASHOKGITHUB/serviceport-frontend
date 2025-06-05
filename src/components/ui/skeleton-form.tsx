import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonForm() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="py-8" style={{ backgroundColor: '#EFEAE3' }}>
            <Skeleton className="h-6 w-32 mx-auto" />
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>
              
              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>
              
              {/* Third Row */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}