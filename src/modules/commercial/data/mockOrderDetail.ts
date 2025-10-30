import { mockCheckout } from '@/modules/commercial/data/mockCheckout';
import { OrderDetail } from '@/modules/commercial/types';

export const mockOrderDetail: OrderDetail = {
  id: 'order-5021',
  orderNumber: 'HA-5021',
  placedAt: '2025-10-29T09:11:30Z',
  fulfillmentMethod: 'delivery',
  store: {
    id: mockCheckout.storeId,
    name: mockCheckout.storeName,
    logoUrl: mockCheckout.storeLogoUrl,
  },
  deliveryAddress: mockCheckout.deliveryAddress,
  pickupAddress: mockCheckout.pickupAddress,
  paymentSummary: {
    method: 'Visa ···· 2846',
    status: 'paid',
    totalCents: mockCheckout.pricing.totalCents,
    currency: 'USD',
  },
  contact: mockCheckout.user,
  items: mockCheckout.items,
  pricing: mockCheckout.pricing,
  timeline: [
    { status: 'init', timestamp: '2025-10-29T09:12:10Z' },
    { status: 'order_received', timestamp: '2025-10-29T09:13:45Z' },
    { status: 'in_process', timestamp: '2025-10-29T09:28:00Z' },
    { status: 'in_delivery', timestamp: '2025-10-29T10:05:00Z' },
    { status: 'complete', timestamp: '2025-10-29T10:42:00Z' },
    { status: 'cancelled', timestamp: null },
    { status: 'fail', timestamp: null },
  ],
  statusNotes: 'Left at reception per delivery note.',
};
