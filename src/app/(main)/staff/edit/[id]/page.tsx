import { Metadata } from 'next';
import StaffEditForm from '@/components/Staff/StaffEditForm';

export const metadata: Metadata = {
  title: 'Edit Staff - Camera Port',
  description: 'Edit staff member details',
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StaffEditPage({ params }: Props) {
  const { id } = await params;
  return <StaffEditForm staffId={id} />;
}