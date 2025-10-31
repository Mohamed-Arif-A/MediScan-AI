import { OfferHelpForm } from '@/components/offer-help-form';

export default function OfferHelpPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          Become a Helper
        </h1>
        <p className="mt-2 text-muted-foreground">
          Register as a donor or volunteer to be notified of needs in your area.
        </p>
      </div>
      <div className="mt-8">
        <OfferHelpForm />
      </div>
    </div>
  );
}
