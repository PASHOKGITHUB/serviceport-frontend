import { Metadata } from 'next';
import LoginForm from '@/components/Auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login - ServiceHub',
  description: 'Login to ServiceHub management system',
};

export default function LoginPage() {
  return <LoginForm />;
}