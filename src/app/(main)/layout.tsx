'use client';

import Sidebar from '@/components/Common/Sidebar';
import Header from '@/components/Common/Header';
import ProtectedRoute from '@/components/Common/ProtectedRoute';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:ml-64">
          <Header />
          {/* Main content area with proper spacing */}
          <main className="pt-16 min-h-[calc(100vh-4rem)]">
            <div className="p-4 sm:p-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}