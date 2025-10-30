import { create } from 'zustand';

import { CartItem, CartItemInput } from '@/modules/commercial/types';

interface CartState {
  items: Record<string, CartItem>;
  totalQuantity: number;
  totalCents: number;
}

interface CartActions {
  addItem: (item: CartItemInput) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

type CartStore = CartState & CartActions;

const recalcTotals = (items: Record<string, CartItem>) => {
  const values = Object.values(items);
  const totalQuantity = values.reduce((acc, item) => acc + item.quantity, 0);
  const totalCents = values.reduce((acc, item) => acc + item.priceCents * item.quantity, 0);

  return { totalQuantity, totalCents };
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: {},
  totalQuantity: 0,
  totalCents: 0,
  addItem: (input) => {
    const quantity = Math.max(1, input.quantity ?? 1);

    set((state) => {
      const existing = state.items[input.id];
      const nextItem: CartItem = {
        ...existing,
        ...input,
        quantity: (existing?.quantity ?? 0) + quantity,
      } as CartItem;

      const nextItems = {
        ...state.items,
        [input.id]: nextItem,
      };

      return {
        items: nextItems,
        ...recalcTotals(nextItems),
      };
    });
  },
  incrementItem: (id) => {
    set((state) => {
      const existing = state.items[id];
      if (!existing) {
        return state;
      }

      const nextItems = {
        ...state.items,
        [id]: {
          ...existing,
          quantity: existing.quantity + 1,
        },
      };

      return {
        items: nextItems,
        ...recalcTotals(nextItems),
      };
    });
  },
  decrementItem: (id) => {
    set((state) => {
      const existing = state.items[id];
      if (!existing) {
        return state;
      }

      if (existing.quantity <= 1) {
        const { [id]: _removed, ...rest } = state.items;
        return {
          items: rest,
          ...recalcTotals(rest),
        };
      }

      const nextItems = {
        ...state.items,
        [id]: {
          ...existing,
          quantity: existing.quantity - 1,
        },
      };

      return {
        items: nextItems,
        ...recalcTotals(nextItems),
      };
    });
  },
  removeItem: (id) => {
    set((state) => {
      if (!state.items[id]) {
        return state;
      }

      const { [id]: _removed, ...rest } = state.items;
      return {
        items: rest,
        ...recalcTotals(rest),
      };
    });
  },
  clearCart: () => {
    if (get().totalQuantity === 0) {
      return;
    }

    set({ items: {}, totalQuantity: 0, totalCents: 0 });
  },
}));
