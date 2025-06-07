import { Metadata } from 'next';
import BranchViewForm from '@/components/Branches/BranchViewForm';

export const metadata: Metadata = {
  title: 'View Branch - Camera Port',
  description: 'View branch details',
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BranchViewPage({ params }: Props) {
  const { id } = await params;
  return <BranchViewForm branchId={id} />;
}