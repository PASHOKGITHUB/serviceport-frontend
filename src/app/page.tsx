import { redirect } from 'next/navigation';

export default function HomePage() {
  // Always redirect to login first
  redirect('/auth/login');
}