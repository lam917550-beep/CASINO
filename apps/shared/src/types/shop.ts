export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'pet' | 'cosmetic' | 'title' | 'avatar' | 'frame' | 'effect' | 'booster' | 'decoration' | 'ticket';
  price: number;
  currency: 'COIN' | 'GEM' | 'TICKET';
  rarity: string;
  stock: number | null;
  availability: 'always' | 'daily' | 'weekly' | 'event';
  purchaseLimit: number | null;
  expiresAt: Date | null;
  enabled: boolean;
  metadata: Record<string, unknown>;
}

export interface Purchase {
  id: string;
  userId: string;
  shopItemId: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  itemType: string;
  quantity: number;
  metadata: Record<string, unknown>;
}
