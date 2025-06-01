import { Metadata } from 'next';
import CustomersList from '@/components/Customers/CustomersList';

export const metadata: Metadata = {
  title: 'Customers - ServiceHub',
  description: 'View customer information and history',
};

export default function CustomersPage() {
  return <CustomersList />;
}