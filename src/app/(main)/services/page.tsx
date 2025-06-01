import { Metadata } from 'next';
import ServicesList from '@/components/Services/ServicesList';

export const metadata: Metadata = {
  title: 'Services - ServiceHub',
  description: 'Manage service requests and tracking',
};

export default function ServicesPage() {
  return <ServicesList />;
}