
'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  UserCredential,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  GeoPoint,
} from 'firebase/firestore';
import { UserRole, UserProfile } from '@/lib/data';
import { initializeFirebase } from '@/firebase';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Initialize Firebase and get SDKs from the centralized function
const { auth, firestore: db } = initializeFirebase();

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function createUser(
  email: string,
  password: string,
  role: UserRole,
  name: string,
): Promise<UserCredential> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  const userProfileData: Omit<UserProfile, 'location'> = {
    uid: user.uid,
    name: name,
    email: user.email!,
    role: role,
    createdAt: serverTimestamp() as any, // Cast because serverTimestamp is not a Timestamp
    isVerified: role === 'ngo' ? false : undefined, // Set verification only for NGOs
  };
  
  // This creates the private user profile
  setDocumentNonBlocking(doc(db, 'users', user.uid), {...userProfileData, location: null}, { merge: false });


  return userCredential;
}

export async function loginUser(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutUser() {
  await auth.signOut();
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    return null;
  }
}


export async function updateUserLocation(userId: string, location: { latitude: number, longitude: number }) {
  const userDocRef = doc(db, 'users', userId);
  const locationGeoPoint = new GeoPoint(location.latitude, location.longitude);
  
  // Update the user's private profile with the new location.
  updateDocumentNonBlocking(userDocRef, { location: locationGeoPoint });
}
