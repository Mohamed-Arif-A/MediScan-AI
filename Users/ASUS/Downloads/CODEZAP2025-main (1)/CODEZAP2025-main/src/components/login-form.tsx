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
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/lib/data';
import { Suspense, useState } from 'react';
import { createUser, loginUser, getUserProfile } from '@/lib/auth';
import { initializeFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { User } from 'firebase/auth';

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isAdminLogin = pathname.startsWith('/admin');
  const role: UserRole = isAdminLogin ? 'admin' : (searchParams.get('role') as UserRole) || 'donor';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const handleRedirect = async (user: User) => {
    const userProfile = await getUserProfile(user.uid);
    // Admins are immediately and unconditionally redirected to their dashboard.
    if (userProfile?.role === 'admin') {
      router.push('/admin/dashboard');
      return;
    }
    
    // All other users (NGO, Donor) are sent to the location setup page.
    // The location setup page will then handle redirecting them if their location is already set.
    router.push('/setup-location');
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      let userCredential;
      if (isSignUp) {
        if (!values.name) {
          toast({
            variant: 'destructive',
            title: 'Name is required for sign up.',
          });
          setIsSubmitting(false);
          return;
        }
        userCredential = await createUser(values.email, values.password, role, values.name);
        toast({
          title: 'Account Created!',
          description: "You've been successfully signed up.",
        });
      } else {
        userCredential = await loginUser(values.email, values.password);
        toast({
          title: 'Logged In!',
          description: "You've been successfully logged in.",
        });
      }

      // Ensure admin user profile has role 'admin' when logging in via /admin
      if (isAdminLogin && userCredential.user?.email === 'admin@gmail.com') {
        const { firestore } = initializeFirebase();
        const userRef = doc(firestore, 'users', userCredential.user.uid);
        setDocumentNonBlocking(userRef, { role: 'admin' }, { merge: true } as any);
      }

      await handleRedirect(userCredential.user);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{role} {isSignUp ? 'Sign Up' : 'Login'}</CardTitle>
        <CardDescription>
          {isSignUp ? 'Create an account to continue.' : 'Login to your account.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isSignUp && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{role === 'ngo' ? 'Organization Name' : 'Full Name'}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={role === 'ngo' ? 'e.g., Helping Hands' : 'e.g., John Doe'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={isAdminLogin ? 'admin@gmail.com' : 'you@example.com'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : (isSignUp ? 'Sign Up' : 'Login')}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
}
