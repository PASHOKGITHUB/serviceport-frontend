import { Metadata } from 'next';
import DashboardContent from '@/components/Dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard - ServicePort',
  description: 'ServicePort management dashboard',
};

export default function DashboardPage() {
  return <DashboardContent />;
}