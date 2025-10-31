import { Suspense } from 'react';
import { LocationSetup } from '@/components/location-setup';

export default function LocationSetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LocationSetup />
    </Suspense>
  );
}
