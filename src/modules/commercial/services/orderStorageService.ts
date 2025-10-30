import AsyncStorage from '@react-native-async-storage/async-storage';

import { CONFIG } from '@/core/config';
import type { OrderDetail } from '@/modules/commercial/types';

const STORAGE_KEY = CONFIG.STORAGE_KEYS.ORDER_HISTORY;

type StoredOrderMap = Record<string, OrderDetail>;

const parseStoredOrders = (raw: string | null): StoredOrderMap => {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as StoredOrderMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('[orderStorageService] Failed to parse stored orders, resetting.', error);
    return {};
  }
};

const serializeOrders = (orders: StoredOrderMap) => JSON.stringify(orders);

export const orderStorageService = {
  async save(order: OrderDetail): Promise<void> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const orders = parseStoredOrders(raw);
    orders[order.id] = order;
    await AsyncStorage.setItem(STORAGE_KEY, serializeOrders(orders));
  },

  async getById(orderId: string): Promise<OrderDetail | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const orders = parseStoredOrders(raw);
    return orders[orderId] ?? null;
  },

  async list(): Promise<OrderDetail[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const orders = parseStoredOrders(raw);
    return Object.values(orders).sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
