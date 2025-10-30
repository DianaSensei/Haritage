import { CheckoutContext } from '@/modules/commercial/types';

export const mockCheckout: CheckoutContext = {
  id: 'chk-001',
  storeId: 'store-aurora',
  storeName: 'Aurora Atelier',
  storeLogoUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=120&q=80',
  deliveryAddress: {
    label: 'Home address',
    detail: '221B Baker Street, London NW1 6XE, United Kingdom',
  },
  pickupAddress: 'Aurora Atelier Studio — 17 Riverbank Arcade, London',
  expectedDeliveryMinutes: 55,
  expectedPickupMinutes: 25,
  expectedDineInMinutes: 15,
  user: {
    name: 'Diana Nguyen',
    email: 'diana.nguyen@example.com',
    phone: '+44 7700 900123',
  },
  items: [
    {
      id: 'chk-item-1',
      name: 'Luminous Wool Coat',
      priceCents: 24800,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&q=80',
      options: [
        { label: 'Size', value: 'Medium' },
        { label: 'Colour', value: 'Graphite' },
      ],
    },
    {
      id: 'chk-item-2',
      name: 'Nimbus Knit Scarf',
      priceCents: 5200,
      quantity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=200&q=80',
      options: [{ label: 'Weave', value: 'Heirloom' }],
    },
    {
      id: 'chk-item-3',
      name: 'Aurora Glow Belt',
      priceCents: 3200,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1503341733010-7aed42970cb9?auto=format&fit=crop&w=200&q=80',
    },
  ],
  pricing: {
    subtotalCents: 38400,
    shippingCents: 1200,
    taxCents: 3400,
    discountCents: 2000,
    totalCents: 41000,
  },
};
