'use client';

import { useEffect, useState } from 'react';
import { GeoPoint } from 'firebase/firestore';
import { getLocationName } from '@/lib/actions';
import { MapPin } from 'lucide-react';

interface LocationNameProps {
  location?: GeoPoint;
  className?: string;
}

export function LocationName({ location, className }: LocationNameProps) {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (location) {
      const fetchLocationName = async () => {
        try {
          const result = await getLocationName({
            latitude: location.latitude,
            longitude: location.longitude,
          });
          setName(result.locationName);
        } catch (error) {
          console.error('Failed to fetch location name:', error);
          setName('Location details unavailable');
        }
      };
      fetchLocationName();
    }
  }, [location]);

  if (!location) {
    return null;
  }

  return (
    <div className={className}>
      {name ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {name}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Loading location...</span>
        </div>
      )}
    </div>
  );
}
