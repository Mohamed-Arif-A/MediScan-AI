"use client";
import { NeedsList } from '@/components/needs-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MapPin, UserCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/data';

export default function NgoDashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold">NGO Dashboard</h1>
          {userProfile && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{userProfile.name}</span>
              <span className="text-muted-foreground">is for</span>
              <span className="text-muted-foreground">{userProfile.email}</span>
              <Badge variant={userProfile.isVerified ? 'default' : 'secondary'} className="ml-2">
                {userProfile.isVerified ? (
                  <span className="inline-flex items-center gap-1"><UserCheck className="h-3 w-3"/> Verified</span>
                ) : (
                  <span className="inline-flex items-center gap-1"><ShieldAlert className="h-3 w-3"/> Unverified</span>
                )}
              </Badge>
            </div>
          )}
          <p className="text-muted-foreground max-w-2xl">
            View and manage your organization's resource requests. Keep track of open and matched needs.
          </p>
        </div>
         <Button asChild variant="outline">
            <Link href="/setup-location">
                <MapPin className="mr-2 h-4 w-4" />
                Update My Location
            </Link>
        </Button>
      </div>
      <NeedsList />
    </div>
  );
}
