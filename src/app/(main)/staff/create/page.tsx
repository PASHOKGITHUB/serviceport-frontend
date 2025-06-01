import { Metadata } from 'next';
import CreateStaffForm from '@/components/Staff/CreateStaffForm';

export const metadata: Metadata = {
  title: 'Add Staff - ServicePort',
  description: 'Add a new staff member',
};

export default function CreateStaffPage() {
  return <CreateStaffForm />;
}