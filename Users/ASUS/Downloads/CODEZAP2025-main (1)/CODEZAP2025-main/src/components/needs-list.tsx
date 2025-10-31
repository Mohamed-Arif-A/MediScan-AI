'use client';

import { useState } from 'react';
import type { Need } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { MoreHorizontal, Package, User, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RequestAidForm } from './request-aid-form';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { LocationName } from './location-name';
import { deleteNeed } from '@/lib/needs';
import { useToast } from '@/hooks/use-toast';

function NeedCard({ need, onEdit }: { need: Need, onEdit: () => void }) {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteNeed(need.id);
      toast({
        title: 'Request Deleted',
        description: 'The aid request has been successfully removed.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message || 'Could not delete the request.',
      });
    }
  };

  return (
     <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className='flex items-center gap-2 font-headline'>
            <Package className="h-6 w-6 text-accent" />
            {need.quantity}{' '}{need.resourceType}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={need.status === 'open' ? 'secondary' : 'default'}>{need.status}</Badge>
            {need.status === 'open' && (
               <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this aid request.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-2">
            <LocationName location={need.location} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground">{need.description}</p>
        {need.status === 'matched' && (
          <div className='mt-4 pt-4 border-t'>
            <p className='text-sm font-semibold flex items-center gap-2'>
              <User className="h-4 w-4 text-primary"/> Matched with a Donor
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function NeedsList() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState<Need | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  const needsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'needs'),
      where('organizationId', '==', user.uid)
    );
  }, [user, firestore]);

  const { data: needs, isLoading } = useCollection<Need>(needsQuery);

  const openNeeds = needs?.filter((need) => need.status === 'open').sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()) ?? [];
  const matchedNeeds = needs?.filter((need) => need.status === 'matched').sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()) ?? [];

  const handleEdit = (need: Need) => {
    setEditingNeed(need);
  };
  
  const handleCloseDialogs = () => {
    setCreateModalOpen(false);
    setEditingNeed(null);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreateModalOpen(true)}>+ Create New Request</Button>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Open Requests</h2>
            {openNeeds.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {openNeeds.map((need) => <NeedCard key={need.id} need={need} onEdit={() => handleEdit(need)} />)}
              </div>
            ) : (
              <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>No Open Requests</AlertTitle>
                <AlertDescription>
                  You have no pending requests for donations.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Matched Requests</h2>
            {matchedNeeds.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {matchedNeeds.map((need) => <NeedCard key={need.id} need={need} onEdit={() => handleEdit(need)} />)}
              </div>
            ) : (
              <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>No Matched Requests</AlertTitle>
                <AlertDescription>
                  None of your requests have been matched with a donor yet.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      <Dialog open={isCreateModalOpen || !!editingNeed} onOpenChange={handleCloseDialogs}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">
              {editingNeed ? 'Edit Request' : 'Create a New Request'}
            </DialogTitle>
            <DialogDescription>
             {editingNeed ? 'Update the details of your aid request below.' : 'Fill out the form below to request resources for your organization.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
             <RequestAidForm 
                onSuccess={handleCloseDialogs} 
                existingNeed={editingNeed}
              />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
