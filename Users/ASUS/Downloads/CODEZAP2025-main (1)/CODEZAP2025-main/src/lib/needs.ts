'use client';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  GeoPoint,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Initialize Firebase and get SDKs from the centralized function
const { auth, firestore: db } = initializeFirebase();

export type CreateNeedData = {
  resourceType: string;
  quantity: number;
  description: string;
};

export async function createNeed(data: CreateNeedData) {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // We need to fetch the user's profile to get their name and location
  const userProfileDoc = await import('@/lib/auth').then(m => m.getUserProfile(user.uid));

  if (!userProfileDoc || !userProfileDoc.location) {
    throw new Error('User profile or location not found. Please refresh and try again.');
  }
  
  const needData = {
    ...data,
    organizationId: user.uid,
    orgName: userProfileDoc.name,
    status: 'open' as const,
    createdAt: serverTimestamp(),
    location: new GeoPoint(userProfileDoc.location.latitude, userProfileDoc.location.longitude),
  };

  const collectionRef = collection(db, 'needs');
  
  // --- THIS IS THE FIX ---
  try {
    await addDoc(collectionRef, needData);
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'create',
          requestResourceData: needData,
      })
    );
    throw error; // Re-throw the error so the UI knows it failed
  }
  // --- END OF FIX ---
}

export async function updateNeed(needId: string, data: CreateNeedData) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
  
    const needRef = doc(db, 'needs', needId);
  
  // --- THIS IS THE FIX ---
  try {
    await updateDoc(needRef, data as any); // Use 'as any' to allow partial updates
  } catch (error) {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
            path: needRef.path,
            operation: 'update',
            requestResourceData: data,
        })
      );
    throw error;
  }
  // --- END OF FIX ---
}

export async function deleteNeed(needId: string) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const needRef = doc(db, 'needs', needId);

  // --- THIS IS THE FIX ---
  try {
    await deleteDoc(needRef);
  } catch (error) {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
            path: needRef.path,
            operation: 'delete',
        })
      );
    throw error;
  }
  // --- END OF FIX ---
}

export async function matchNeed(needId: string) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
  
    const needRef = doc(db, 'needs', needId);
  
    const updateData = {
         status: 'matched',
        matchedDonorId: user.uid,
    };

  // --- THIS IS THE FIX ---
  try {
    await updateDoc(needRef, updateData);
  } catch (error) {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
            path: needRef.path,
            operation: 'update',
            requestResourceData: updateData
        })
      );
    throw error;
  }
  // --- END OF FIX ---
}