
import { Suspense } from 'react';
import { LoginForm } from '@/components/login-form';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto max-w-sm px-4 py-8 md:py-12">
        <LoginForm />
      </div>
    </Suspense>
  );
}
