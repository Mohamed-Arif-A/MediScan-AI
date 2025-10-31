'use client';

import type { Need, UserProfile } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Building, Info, Loader2, Settings, Compass } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, GeoPoint } from 'firebase/firestore';
import { matchNeed } from '@/lib/needs';
import { useMemo, useState } from 'react';
import { getSuggestedRadius } from '@/lib/actions';
import { Slider } from '@/components/ui/slider';
import { useRouter } from 'next/navigation';
import { LocationName } from '@/components/location-name';

// Haversine formula to calculate distance between two lat/lng points
function getDistanceInKm(point1: GeoPoint, point2: GeoPoint) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(point2.latitude - point1.latitude);
  const dLon = deg2rad(point2.longitude - point1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.latitude)) * Math.cos(deg2rad(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default function DonorDashboardPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [radius, setRadius] = useState(10); // Default search radius in km
  const [isSuggestingRadius, setIsSuggestingRadius] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const needsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'needs'),
      where('status', '==', 'open')
    );
  }, [firestore]);

  const { data: openNeeds, isLoading: areNeedsLoading } = useCollection<Need>(needsQuery);
  
  const filteredNeeds = useMemo(() => {
    if (!openNeeds || !userProfile?.location) return [];
    
    return openNeeds.filter(need => {
      // Ensure need.location is a GeoPoint instance for distance calculation
      if (!(need.location instanceof GeoPoint)) return false;
      // Don't show own needs if user is also an NGO
      if (userProfile.role === 'ngo' && need.organizationId === userProfile.uid) return false;

      const distance = getDistanceInKm(userProfile.location as GeoPoint, need.location);
      return distance <= radius;
    });
  }, [openNeeds, userProfile, radius]);

  const handleHelp = async (needId: string) => {
    try {
      await matchNeed(needId);
      toast({
        title: 'Match Made!',
        description: "Thank you for your generosity! The NGO has been notified.",
      });
    } catch (error: any) {
      console.error("Failed to match need:", error);
      toast({
        variant: 'destructive',
        title: 'Match Failed',
        description: error.message || "There was a problem matching this need.",
      });
    }
  };

  const handleSuggestRadius = async () => {
    if (!userProfile?.location) {
        toast({ title: "Location not set", description: "We need your location to suggest a radius.", variant: 'destructive'});
        return;
    }
    setIsSuggestingRadius(true);
    try {
        const result = await getSuggestedRadius({
            locationDescription: `A user at latitude ${userProfile.location.latitude} and longitude ${userProfile.location.longitude}`,
            initialRadiusKm: radius,
            resourceNeeded: 'general supplies' // a generic term for now
        });
        setRadius(Math.round(result.suggestedRadiusKm));
        toast({
            title: "Radius Suggestion Updated!",
            description: result.reasoning
        });

    } catch (error) {
        console.error("Error suggesting radius:", error);
        toast({ title: "Suggestion Failed", description: "Couldn't get a suggestion right now.", variant: 'destructive'});
    } finally {
        setIsSuggestingRadius(false);
    }
  };

  if (areNeedsLoading || isProfileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 space-y-2">
        <h1 className="font-headline text-3xl font-bold">Donor Dashboard</h1>
        <p className="text-muted-foreground max-w-2xl">
          Find and fulfill requests from NGOs in your local area. Your generosity makes a world of difference.
        </p>
      </div>

       <Card className="mb-8 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6"/>
            Search Settings
          </CardTitle>
          <CardDescription>Adjust the radius to find needs near you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="radius" className="font-medium">Radius: {radius} km</label>
              <Slider
                id="radius"
                min={1}
                max={100}
                step={1}
                value={[radius]}
                onValueChange={(value) => setRadius(value[0])}
                className="flex-1"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleSuggestRadius} disabled={isSuggestingRadius} variant="outline">
                {isSuggestingRadius ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Compass className="mr-2 h-4 w-4" />}
                Suggest Radius (AI)
                </Button>
                <Button onClick={() => router.push('/setup-location')} variant="secondary">
                  <MapPin className="mr-2 h-4 w-4"/>
                  Update My Location
                </Button>
            </div>
        </CardContent>
      </Card>


      {filteredNeeds.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNeeds.map((need) => (
            <Card key={need.id} className="flex flex-col transition-shadow hover:shadow-lg bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline">
                  <Package className="h-7 w-7 text-primary" />
                  <span>{need.quantity} {need.resourceType}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-2">
                  <Building className="h-4 w-4" />
                  {need.orgName}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <p className="text-sm text-muted-foreground">{need.description}</p>
                <div className="flex items-center justify-between">
                  <LocationName location={need.location} />
                  {(userProfile?.location && need.location instanceof GeoPoint) && (
                    <span className="text-sm font-medium text-muted-foreground">
                      {getDistanceInKm(userProfile.location, need.location).toFixed(1)} km away
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 bg-transparent mt-auto">
                <Button className="w-full font-bold btn-gradient" onClick={() => handleHelp(need.id)}>
                  I Can Help
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted/50 rounded-lg bg-muted/20">
            <Alert className="max-w-md text-center bg-transparent border-0">
              <Info className="h-5 w-5 mx-auto mb-2" />
              <AlertTitle className="font-bold">No Nearby Requests</AlertTitle>
              <AlertDescription>
                There are currently no open requests within your search radius. Try increasing it or check back later!
              </AlertDescription>
            </Alert>
        </div>
      )}
    </div>
  );
}
