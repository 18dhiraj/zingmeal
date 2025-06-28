// app/auth/page.tsx
import { cookies } from 'next/headers';
import AuthClient from './AuthClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In or Register | ZingMeal',
  description: 'Access your ZingMeal account or create a new one to start planning personalized meals tailored to your preferences.',
};

export default async function AuthPage() {
  const uid = (await cookies()).get('firebaseUid')?.value ?? null;

  return <AuthClient initialUid={uid} />;
}
