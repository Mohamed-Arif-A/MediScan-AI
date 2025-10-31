import Link from 'next/link';
import { HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <HeartHandshake className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline">
              Urudhunai
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-2 sm:justify-end">
          <Button variant="ghost" asChild>
            <Link href="/login?role=ngo">NGO Portal</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/login?role=donor">Donor Portal</Link>
          </Button>
           <Button variant="outline" asChild>
            <Link href="/admin/login">Admin Portal</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
