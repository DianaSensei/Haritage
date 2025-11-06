/**
 * Mock services data for stores with booking enabled
 */
import { Service } from '../types';

export const mockServices: Service[] = [
  // Luna Living store services
  {
    id: 'service-luna-consultation',
    storeId: 'store-luna-living',
    name: 'Interior Design Consultation',
    description: 'One-on-one consultation with our interior design expert',
    durationMinutes: 60,
    bufferBeforeMinutes: 15,
    bufferAfterMinutes: 15,
    capacity: 1,
    price: '$75',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'service-luna-workshop',
    storeId: 'store-luna-living',
    name: 'DIY Home Decor Workshop',
    description: 'Group workshop for creating minimalist home decor',
    durationMinutes: 120,
    bufferBeforeMinutes: 30,
    bufferAfterMinutes: 30,
    capacity: 6,
    price: '$45',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'service-luna-custom-order',
    storeId: 'store-luna-living',
    name: 'Custom Furniture Design',
    description: 'Discuss custom furniture pieces for your space',
    durationMinutes: 90,
    bufferBeforeMinutes: 15,
    bufferAfterMinutes: 15,
    capacity: 1,
    price: '$100',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];

/**
 * Get services for a specific store
 */
export function getServicesByStoreId(storeId: string): Service[] {
  return mockServices.filter((service) => service.storeId === storeId);
}

/**
 * Get a specific service by ID
 */
export function getServiceById(serviceId: string): Service | undefined {
  return mockServices.find((service) => service.id === serviceId);
}

/**
 * Check if a store has booking enabled
 * In the real app, this would come from the store data
 */
export function isBookingEnabledForStore(storeId: string): boolean {
  // For now, only Luna Living has booking enabled
  const bookingEnabledStores = ['store-luna-living'];
  return bookingEnabledStores.includes(storeId);
}
