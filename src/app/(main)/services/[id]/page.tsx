// src/app/(main)/services/[id]/page.tsx

import { Metadata } from 'next';
import ServiceDetails from '@/components/Services/ServiceDetails';

export const metadata: Metadata = {
  title: 'Service Details - ServiceHub',
  description: 'View and manage service details',
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;
  return <ServiceDetails serviceId={id} />;
}