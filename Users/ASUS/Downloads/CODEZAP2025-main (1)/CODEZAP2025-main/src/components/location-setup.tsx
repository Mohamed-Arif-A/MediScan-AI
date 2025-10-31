'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updateUserLocation, getUserProfile } from '@/lib/auth';
import { Loader2, MapPin } from 'lucide-react';
import { useUser } from '@/firebase';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function LocationSetup() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: authUser, isUserLoading } = useUser();
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');


  const redirectToDashboard = async (uid: string) => {
    const userProfile = await getUserProfile(uid);
    if (userProfile?.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (userProfile?.role === 'ngo') {
      router.push('/ngo-dashboard');
    } else if (userProfile?.role === 'donor') {
      router.push('/donor-dashboard');
    } else {
      router.push('/'); // Fallback
    }
  };


  useEffect(() => {
    const initialize = async () => {
      if (isUserLoading) {
        return; 
      }
      if (!authUser) {
        router.push('/login');
        return;
      }
      
      const userProfile = await getUserProfile(authUser.uid);
      if (userProfile?.role === 'admin') {
        router.push('/admin/dashboard');
        return;
      }
      
      if (userProfile?.location) {
          redirectToDashboard(authUser.uid);
          return;
      }

      handleLocation();
    };

    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, isUserLoading, router]);

  const saveLocation = async (coords: { latitude: number, longitude: number }) => {
    if (!authUser) return;
    
    // Prevent location saving for admin role as a failsafe
    const userProfile = await getUserProfile(authUser.uid);
    if (userProfile?.role === 'admin') {
        router.push('/admin/dashboard');
        return;
    }

    setIsSaving(true);
    try {
      await updateUserLocation(authUser.uid, coords);
      toast({
        title: 'Location Saved!',
        description: 'Your location has been successfully updated.',
      });
      await redirectToDashboard(authUser.uid);
    } catch (error) {
      console.error(error);
      const errorMsg = 'Could not save your location. Please try again.';
      toast({ variant: 'destructive', title: 'Failed to Save Location', description: errorMsg });
      setErrorState(errorMsg);
    } finally {
      setIsSaving(false);
      setIsLocating(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        toast({
            variant: 'destructive',
            title: 'Invalid Coordinates',
            description: 'Please enter valid latitude (-90 to 90) and longitude (-180 to 180).',
        });
        return;
    }
    await saveLocation({ latitude: lat, longitude: lon });
  }

  const handleLocation = async () => {
    if (!authUser) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to set your location.',
      });
      router.push('/login');
      return;
    }

    if (!navigator.geolocation) {
      const errorMsg = 'Your browser does not support geolocation.';
      toast({ variant: 'destructive', title: 'Geolocation Not Supported', description: errorMsg });
      setErrorState(errorMsg);
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    setErrorState(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await saveLocation(position.coords);
      },
      (error) => {
        let errorMsg = error.message || 'Please enable location permissions for this site.';
        if (error.code === error.PERMISSION_DENIED && error.message.includes('Permissions Policy')) {
            errorMsg = 'Geolocation has been disabled by the browser\'s permissions policy. Please try again or enter your location manually.';
        }
        toast({ variant: 'destructive', title: 'Failed to Get Location', description: errorMsg });
        setErrorState(errorMsg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  if (isUserLoading || !authUser) {
     return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle>One Last Step: Set Your Location</CardTitle>
          <CardDescription>
            To connect you with local needs, we need your location. You can allow automatic detection or enter it manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
          <MapPin className="h-16 w-16 text-primary" />
          
          {(isLocating || isSaving) && !errorState && (
             <div className='text-center space-y-2'>
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">{isSaving ? 'Saving...' : 'Getting your location...'}</p>
                {!isSaving && <p className="text-center text-sm text-muted-foreground/80">Please "Allow" when your browser asks for permission.</p>}
            </div>
          )}

          {errorState && (
             <div className='text-center space-y-4 w-full'>
                <p className="text-destructive font-medium">
                  Automatic detection failed: {errorState}
                </p>
                <Button
                    onClick={handleLocation}
                    className="w-full font-bold"
                    size="lg"
                    variant="outline"
                    disabled={isLocating}
                >
                    <MapPin className='mr-2'/>
                    {isLocating ? 'Retrying...' : 'Try Automatic Again'}
                </Button>
            </div>
          )}
        </CardContent>

        {errorState && (
          <>
            <CardFooter className="flex-col gap-4 items-stretch">
               <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or Enter Manually
                  </span>
                </div>
              </div>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input id="latitude" placeholder="e.g., 34.0522" value={latitude} onChange={e => setLatitude(e.target.value)} required type="number" step="any" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input id="longitude" placeholder="e.g., -118.2437" value={longitude} onChange={e => setLongitude(e.target.value)} required type="number" step="any" />
                  </div>
                   <Button type="submit" className="w-full font-bold" disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Location'}
                   </Button>
              </form>
            </CardFooter>
           </>
        )}
      </Card>
    </div>
  );
}
