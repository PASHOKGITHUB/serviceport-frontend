import { Metadata } from 'next';
import CreateBranchForm from '@/components/Branches/CreateBranchForm';

export const metadata: Metadata = {
  title: 'Create Branch - ServicePort',
  description: 'Create a new branch location',
};

export default function CreateBranchPage() {
  return <CreateBranchForm />;
}