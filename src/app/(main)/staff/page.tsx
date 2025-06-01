import { Metadata } from 'next';
import StaffList from '@/components/Staff/StaffList';

export const metadata: Metadata = {
  title: 'Staff Management - ServicePort',
  description: 'Manage staff members and roles',
};

export default function StaffPage() {
  return <StaffList />;
}