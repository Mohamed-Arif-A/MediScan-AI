
'use server';

/**
 * @fileOverview Generates a human-readable location description from coordinates.
 *
 * - generateLocationDescription - A function that returns a descriptive location name.
 * - GenerateLocationDescriptionInput - The input type for the function.
 * - GenerateLocationDescriptionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLocationDescriptionInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
});
export type GenerateLocationDescriptionInput = z.infer<typeof GenerateLocationDescriptionInputSchema>;

const GenerateLocationDescriptionOutputSchema = z.object({
  locationName: z
    .string()
    .describe('A human-readable description of the location (e.g., neighborhood, city, state).'),
});
export type GenerateLocationDescriptionOutput = z.infer<typeof GenerateLocationDescriptionOutputSchema>;


export async function generateLocationDescription(input: GenerateLocationDescriptionInput): Promise<GenerateLocationDescriptionOutput> {
  return generateLocationDescriptionFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateLocationDescriptionPrompt',
  input: {schema: GenerateLocationDescriptionInputSchema},
  output: {schema: GenerateLocationDescriptionOutputSchema},
  prompt: `You are an expert reverse geocoding service. Your task is to convert geographic coordinates (latitude and longitude) into a human-readable address or place name.
Provide the most specific, yet concise, location name possible. Prioritize returning a well-known neighborhood, locality, or city. For example, for latitude 12.92 and longitude 80.12, the answer should be 'Tambaram, Chennai'.

Latitude: {{{latitude}}}
Longitude: {{{longitude}}}

Return only the single, most relevant location name in the specified output format.
`,
});

const generateLocationDescriptionFlow = ai.defineFlow(
  {
    name: 'generateLocationDescriptionFlow',
    inputSchema: GenerateLocationDescriptionInputSchema,
    outputSchema: GenerateLocationDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
