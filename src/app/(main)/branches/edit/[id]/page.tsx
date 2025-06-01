import { Metadata } from 'next';
import BranchEditForm from '@/components/Branches/BranchEditForm';

export const metadata: Metadata = {
  title: 'Edit Branch - Camera Port',
  description: 'Edit branch details',
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BranchEditPage({ params }: Props) {
  const { id } = await params;
  return <BranchEditForm branchId={id} />;
}