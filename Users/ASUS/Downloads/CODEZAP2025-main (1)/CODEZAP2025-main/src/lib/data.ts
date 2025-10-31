'use client';
import { Timestamp, GeoPoint } from 'firebase/firestore';


export type UserRole = 'donor' | 'ngo' | 'admin';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
  location?: GeoPoint;
  isVerified?: boolean;
};

export type Need = {
  id: string;
  organizationId: string;
  orgName: string;
  resourceType: string;
  quantity: number;
  location: GeoPoint;
  description: string;
  status: 'open' | 'matched' | 'fulfilled';
  createdAt: Timestamp;
  matchedDonorId?: string;
};

export type ResourceOffering = {
  id:string;
  userId: string;
  location: GeoPoint;
  // Other fields as needed
}

export const mockNeeds: Omit<Need, 'id' | 'location' | 'createdAt'>[] = [
    {
      organizationId: 'org1',
      orgName: 'City Hope Initiative',
      resourceType: 'Blankets',
      quantity: 50,
      description: 'Warm blankets for the community shelter.',
      status: 'open',
    },
    {
      organizationId: 'org2',
      orgName: 'Nourish Now',
      resourceType: 'Canned Goods',
      quantity: 200,
      description: 'Non-perishable food items for the food bank.',
      status: 'open',
    },
    {
      organizationId: 'org3',
      orgName: 'Helping Hands',
      resourceType: 'Soup Kitchen Volunteers',
      quantity: 10,
      description: 'Volunteers needed to serve meals.',
      status: 'matched',
    },
  ];
