'use server';

/**
 * @fileOverview Suggests a dynamic radius for finding donors/volunteers based on location density.
 *
 * - suggestDynamicRadius - A function that suggests a radius for finding donors/volunteers.
 * - SuggestDynamicRadiusInput - The input type for the suggestDynamicRadius function.
 * - SuggestDynamicRadiusOutput - The return type for the suggestDynamicRadius function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDynamicRadiusInputSchema = z.object({
  locationDescription: z
    .string()
    .describe('A description of the location where resources are needed.'),
  initialRadiusKm: z
    .number()
    .describe('The initial radius in kilometers to search for resources.'),
  resourceNeeded: z.string().describe('The type of resource needed.'),
});
export type SuggestDynamicRadiusInput = z.infer<typeof SuggestDynamicRadiusInputSchema>;

const SuggestDynamicRadiusOutputSchema = z.object({
  suggestedRadiusKm: z
    .number() 
    .describe('The suggested radius in kilometers to use for finding resources.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested radius adjustment.'),
});
export type SuggestDynamicRadiusOutput = z.infer<typeof SuggestDynamicRadiusOutputSchema>;

export async function suggestDynamicRadius(input: SuggestDynamicRadiusInput): Promise<SuggestDynamicRadiusOutput> {
  return suggestDynamicRadiusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDynamicRadiusPrompt',
  input: {schema: SuggestDynamicRadiusInputSchema},
  output: {schema: SuggestDynamicRadiusOutputSchema},
  prompt: `You are an expert in resource allocation and logistics. Given a description of a location, 
you will suggest an optimal radius in kilometers for finding donors or volunteers for a specific resource need.

Consider the location's density and the resource needed to determine if the initial radius should be adjusted.
If the location is densely populated, a smaller radius might be sufficient. If the location is sparsely populated,
a larger radius might be necessary.

Location Description: {{{locationDescription}}}
Initial Radius: {{{initialRadiusKm}}} km
Resource Needed: {{{resourceNeeded}}}

Based on this information, provide a suggested radius in kilometers and a brief explanation of your reasoning.

Make sure the suggestedRadiusKm value is a number.

Here's an example:
{
  "suggestedRadiusKm": 3,
  "reasoning": "The location is a densely populated urban area, so a smaller radius should yield sufficient results."
}
`,
});

const suggestDynamicRadiusFlow = ai.defineFlow(
  {
    name: 'suggestDynamicRadiusFlow',
    inputSchema: SuggestDynamicRadiusInputSchema,
    outputSchema: SuggestDynamicRadiusOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
