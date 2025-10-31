
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Building, User, HeartHandshake } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <section className="text-center">
        <HeartHandshake className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="mb-4 font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Welcome to Urudhunai
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Connecting communities and bridging the gap between those who need help and those who can provide it.
        </p>
      </section>

      <section>
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          <Card className="flex flex-col text-center transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl overflow-hidden rounded-xl">
            {(() => {
              const ngoImage = PlaceHolderImages.find(p => p.id === 'ngo-portal');
              if (ngoImage) {
                return (
                  <div className="relative h-56 w-full">
                    <Image
                      src={ngoImage.imageUrl}
                      alt={ngoImage.description}
                      data-ai-hint={ngoImage.imageHint}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                );
              }
              return null;
            })()}
            <CardHeader className="relative flex-grow">
               <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary border-2 border-primary">
                <Building className="h-8 w-8" />
              </div>
              <CardTitle className="font-headline text-2xl">For NGOs</CardTitle>
              <CardDescription className="mt-2">
                Are you an organization looking for resources? Post your needs and connect with donors.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Button asChild size="lg" className="w-full font-bold btn-gradient transition-transform hover:scale-105 mt-4">
                <Link href="/login?role=ngo">
                  Enter NGO Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col text-center transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl overflow-hidden rounded-xl">
             {(() => {
                const donorImage = PlaceHolderImages.find(p => p.id === 'donor-portal');
                if (donorImage) {
                    return (
                        <div className="relative h-56 w-full">
                            <Image
                            src={donorImage.imageUrl}
                            alt={donorImage.description}
                            data-ai-hint={donorImage.imageHint}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/30" />
                        </div>
                    );
                }
                return null;
            })()}
            <CardHeader className="relative flex-grow">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent border-2 border-accent">
                <User className="h-8 w-8" />
              </div>
              <CardTitle className="font-headline text-2xl">For Donors</CardTitle>
              <CardDescription className="mt-2">
                Ready to make a difference? Find donation requests from verified NGOs and contribute.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
               <Button asChild size="lg" className="w-full font-bold bg-secondary text-secondary-foreground transition-transform hover:scale-105 mt-4 hover:bg-secondary/90">
                <Link href="/login?role=donor">
                  Enter Donor Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-16 md:my-24" />

      <section className="text-center max-w-4xl mx-auto">
        <h2 className="mb-4 font-headline text-3xl font-bold md:text-4xl">About Us</h2>
        <p className="mx-auto text-muted-foreground md:text-lg">
          Urudhunai, meaning 'support' or 'assistance', is a platform dedicated to fostering a spirit of community and mutual aid. We believe that technology can be a powerful tool for good, enabling us to quickly and efficiently connect NGOs and community organizations with generous donors and volunteers. Our mission is to make giving and receiving help as simple and effective as possible.
        </p>
      </section>
      
      <footer className="mt-16 md:mt-24 border-t pt-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Team Urudhunai. All rights reserved.</p>
      </footer>
    </div>
  );
}
