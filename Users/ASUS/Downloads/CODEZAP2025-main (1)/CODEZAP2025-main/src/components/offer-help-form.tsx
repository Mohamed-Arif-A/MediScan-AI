'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Your name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  location: z.string().min(5, { message: 'Please provide your general location (e.g., city, neighborhood).' }),
  resources: z.string().min(10, { message: 'Please list the resources you can provide.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function OfferHelpForm() {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      location: '',
      resources: '',
    },
  });

  function onSubmit(values: FormValues) {
    console.log('Form Submitted:', values);
    toast({
      title: 'Registration Successful!',
      description: 'Thank you for offering to help. We will notify you of matching needs.',
    });
    form.reset();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Alice Johnson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g., alice@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Uptown District, Anytown" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide your neighborhood or city. This helps us find local matches.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resources You Can Provide</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I can volunteer on weekends, I have a car for deliveries, I can donate canned goods and winter clothes."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full font-bold" disabled={form.formState.isSubmitting}>
              Register to Help
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
