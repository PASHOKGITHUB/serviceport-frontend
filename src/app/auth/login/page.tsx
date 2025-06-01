import { Metadata } from 'next';
import LoginForm from '@/components/Auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login - ServicePort',
  description: 'Login to ServicePort management system',
};

export default function LoginPage() {
  return <LoginForm />;
}