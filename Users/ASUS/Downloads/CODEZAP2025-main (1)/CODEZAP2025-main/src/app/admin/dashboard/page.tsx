'use client';

import { useEffect, useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/data';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

async function setNgoVerified(ngoId: string, value: boolean) {
  const { firestore } = await import('@/firebase').then(m => m.initializeFirebase());
  const userRef = doc(firestore, 'users', ngoId);
  return updateDoc(userRef, { isVerified: value });
}

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  const ngosQueryRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'ngo'));
  }, [firestore]);

  const ngosQuery = useCollection<UserProfile>(ngosQueryRef);

  useEffect(() => {
    if (!isUserLoading && (!user || user.email !== 'admin@gmail.com')) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  const handleToggleVerify = async (ngoId: string, nextValue: boolean) => {
    setIsVerifying(ngoId);
    try {
      await setNgoVerified(ngoId, nextValue);
      toast({
        title: nextValue ? 'NGO Verified!' : 'NGO Unverified',
        description: nextValue ? 'The NGO has been marked as verified.' : 'The NGO has been marked as unverified.',
      });
    } catch (error: any) {
      console.error('Verification toggle failed:', error);
      toast({
        variant: 'destructive',
        title: 'Operation Failed',
        description: error.message || 'There was a problem updating verification status.',
      });
    } finally {
      setIsVerifying(null);
    }
  };

  if (isUserLoading || ngosQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Verify and manage NGOs on the platform.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ngosQuery.data?.map((ngo) => (
          <Card key={ngo.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {ngo.name}
                <Badge variant={ngo.isVerified ? 'default' : 'secondary'}>
                  {ngo.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </CardTitle>
              <CardDescription>{ngo.email}</CardDescription>
            </CardHeader>
            <CardContent>
              {ngo.isVerified ? (
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center text-green-600">
                    <UserCheck className="mr-2 h-4 w-4" />
                    <span>Verified</span>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-32"
                    onClick={() => handleToggleVerify(ngo.id, false)}
                    disabled={isVerifying === ngo.id}
                  >
                    {isVerifying === ngo.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Unverify
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleToggleVerify(ngo.id, true)}
                  disabled={isVerifying === ngo.id}
                >
                  {isVerifying === ngo.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Verify NGO
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
