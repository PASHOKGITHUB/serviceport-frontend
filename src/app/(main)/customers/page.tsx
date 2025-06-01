import { Metadata } from 'next';
import CustomersList from '@/components/Customers/CustomersList';

export const metadata: Metadata = {
  title: 'Customers - ServicePort',
  description: 'View customer information and history',
};

export default function CustomersPage() {
  return <CustomersList />;
}