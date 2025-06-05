import { Metadata } from 'next';
import StaffView from '@/components/Staff/StaffView';

export const metadata: Metadata = {
  title: 'Staff Details - Camera Port',
  description: 'View staff member details',
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StaffViewPage({ params }: Props) {
  const { id } = await params;
  return <StaffView staffId={id} />;
}