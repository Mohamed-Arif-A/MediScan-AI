'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createNeed, updateNeed, type CreateNeedData } from '@/lib/needs';
import { Loader2 } from 'lucide-react';
import type { Need } from '@/lib/data';
import { useEffect } from 'react';

const formSchema = z.object({
  resourceType: z.string().min(3, { message: 'Please describe the resource you need.' }),
  quantity: z.coerce.number().positive({ message: 'Please enter a valid quantity.' }),
  description: z.string().min(10, { message: 'Please provide a detailed description.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface RequestAidFormProps {
  onSuccess?: () => void;
  existingNeed?: Need | null;
}

export function RequestAidForm({ onSuccess, existingNeed }: RequestAidFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resourceType: '',
      quantity: 1,
      description: '',
    },
  });
  
  useEffect(() => {
    if (existingNeed) {
      form.reset({
        resourceType: existingNeed.resourceType,
        quantity: existingNeed.quantity,
        description: existingNeed.description,
      });
    } else {
        form.reset({
            resourceType: '',
            quantity: 1,
            description: '',
        })
    }
  }, [existingNeed, form]);


  const onSubmit = async (values: CreateNeedData) => {
    try {
        if(existingNeed) {
            await updateNeed(existingNeed.id, values);
            toast({
                title: 'Request Updated!',
                description: 'Your request has been successfully updated.',
            });
        } else {
            await createNeed(values);
            toast({
                title: 'Request Submitted!',
                description: 'Your request is now visible to nearby donors.',
            });
        }
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to submit need:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'There was a problem submitting your request.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="resourceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource Needed</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Blankets, Canned Goods" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the need in detail. e.g., 'Warm blankets for 50 people at the downtown community shelter.'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full font-bold" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {existingNeed ? 'Save Changes' : 'Submit Request'}
        </Button>
      </form>
    </Form>
  );
}
