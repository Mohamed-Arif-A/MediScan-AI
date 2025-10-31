import { RequestAidForm } from '@/components/request-aid-form';

export default function RequestAidPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          Submit a Resource Request
        </h1>
        <p className="mt-2 text-muted-foreground">
          Let us know what you need, and we'll help find a match in your community.
        </p>
      </div>
      <div className="mt-8">
        <RequestAidForm />
      </div>
    </div>
  );
}
