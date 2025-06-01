import { Metadata } from 'next';
import EditServiceForm from '@/components/Services/ServiceEditForm';

export const metadata: Metadata = {
  title: 'Edit Service - ServiceHub',
  description: 'Edit service details',
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ServiceEditPage({ params }: Props) {
  const { id } = await params;
  return <EditServiceForm serviceId={id} />;
}