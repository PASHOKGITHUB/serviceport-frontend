import { Metadata } from 'next';
import ServiceView from '@/components/Services/ServiceView';

export const metadata: Metadata = {
  title: 'Service Details - Camera Port',
  description: 'View service details and manage service status',
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ServiceViewPage({ params }: Props) {
  // Use params to avoid unused variable warning
  const { id } = await params;
  return <ServiceView serviceId={id} />;
}
