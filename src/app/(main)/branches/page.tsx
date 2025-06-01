import { Metadata } from 'next';
import BranchesList from '@/components/Branches/BranchesList';

export const metadata: Metadata = {
  title: 'Branches - ServiceHub',
  description: 'Manage branch locations',
};

export default function BranchesPage() {
  return <BranchesList />;
}