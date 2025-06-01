import { Metadata } from 'next';
import CreateServiceForm from '@/components/Services/CreateServiceForm';

export const metadata: Metadata = {
  title: 'Create Service - ServiceHub',
  description: 'Create a new service request',
};

export default function CreateServicePage() {
  return <CreateServiceForm />;
}