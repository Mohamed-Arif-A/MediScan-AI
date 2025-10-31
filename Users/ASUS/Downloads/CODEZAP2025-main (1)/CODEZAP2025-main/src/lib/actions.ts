
'use server';

import { suggestDynamicRadius, type SuggestDynamicRadiusInput, type SuggestDynamicRadiusOutput } from '@/ai/flows/suggest-dynamic-radius';
import { generateLocationDescription, type GenerateLocationDescriptionInput, type GenerateLocationDescriptionOutput } from '@/ai/flows/generate-location-description';
import { z } from 'zod';

const SuggestRadiusActionInputSchema = z.object({
  locationDescription: z.string(),
  initialRadiusKm: z.number(),
  resourceNeeded: z.string(),
});

export async function getSuggestedRadius(input: SuggestDynamicRadiusInput): Promise<SuggestDynamicRadiusOutput> {
  const parsedInput = SuggestRadiusActionInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error('Invalid input for getSuggestedRadius');
  }

  try {
    const result = await suggestDynamicRadius(parsedInput.data);
    return result;
  } catch (error) {
    console.error("Error in getSuggestedRadius action:", error);
    return {
        suggestedRadiusKm: input.initialRadiusKm,
        reasoning: "Could not generate a suggestion at this time. Please try again later."
    }
  }
}

const GetLocationNameActionInputSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
});

// In-memory cache for location names
const locationCache = new Map<string, string>();

export async function getLocationName(input: GenerateLocationDescriptionInput): Promise<GenerateLocationDescriptionOutput> {
    const parsedInput = GetLocationNameActionInputSchema.safeParse(input);
    if (!parsedInput.success) {
      throw new Error('Invalid input for getLocationName');
    }

    const { latitude, longitude } = parsedInput.data;
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

    // Check cache first
    if (locationCache.has(cacheKey)) {
        return { locationName: locationCache.get(cacheKey)! };
    }
  
    try {
      const result = await generateLocationDescription(parsedInput.data);
      // Store successful result in cache
      locationCache.set(cacheKey, result.locationName);
      return result;
    } catch (error: any) {
        if (error.message && (error.message.includes('429') || error.message.includes('Too Many Requests'))) {
             console.warn("AI rate limit hit for location generation. Returning fallback.");
        } else {
            console.error("Error in getLocationName action:", error);
        }
        // Return a fallback but don't cache it
        return {
            locationName: "Location Unavailable"
        }
    }
  }
