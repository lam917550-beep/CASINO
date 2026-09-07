export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'secret';

export interface Pet {
  id: string;
  name: string;
  rarity: PetRarity;
  price: number;
  sellPrice: number;
  level: number;
  xp: number;
  maxLevel: number;
  passiveEffect: PetPassiveEffect;
  visual: string;
  description: string;
  obtainableFrom: string;
  active: boolean;
  metadata: Record<string, unknown>;
}

export interface PetPassiveEffect {
  type: 'xp_boost' | 'coin_boost' | 'daily_bonus' | 'cooldown_reduction' | 'cosmetic';
  value: number;
  description: string;
}

export interface UserPet {
  id: string;
  userId: string;
  petId: string;
  level: number;
  xp: number;
  equipped: boolean;
  acquiredAt: Date;
}
