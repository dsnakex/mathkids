// Boutique « Le comptoir du chef » (SPECIFICATIONS §7, handoff écran 6).
// Catalogue et logique d'achat, purs. Les achats se font UNIQUEMENT avec le riz
// doré gagné en jouant — aucun achat réel, aucune monnaie réelle.

export type ShopCategory = 'garniture' | 'accessoire' | 'fond'

export interface ShopItem {
  id: string
  category: ShopCategory
  label: string
  emoji: string
  price: number // en grains de riz dorés
}

// Emoji placeholders acceptables en v1 (voir handoff « Fidelity »).
export const SHOP_ITEMS: ShopItem[] = [
  // Garnitures
  { id: 'garniture-crevette', category: 'garniture', label: 'Crevette', emoji: '🍤', price: 40 },
  { id: 'garniture-omelette', category: 'garniture', label: 'Omelette', emoji: '🍳', price: 40 },
  { id: 'garniture-avocat', category: 'garniture', label: 'Avocat', emoji: '🥑', price: 30 },
  // Accessoires
  { id: 'accessoire-noeud', category: 'accessoire', label: 'Nœud', emoji: '🎀', price: 50 },
  { id: 'accessoire-cape', category: 'accessoire', label: 'Cape de nori', emoji: '🦸', price: 80 },
  { id: 'accessoire-wasabi', category: 'accessoire', label: 'Wasabi rigolo', emoji: '🟢', price: 60 },
  // Fonds d'écran
  { id: 'fond-lampion', category: 'fond', label: 'Lampions', emoji: '🏮', price: 80 },
  { id: 'fond-sakura', category: 'fond', label: 'Sakura', emoji: '🌸', price: 80 },
  { id: 'fond-mont', category: 'fond', label: 'Mont Fuji', emoji: '🗻', price: 100 },
]

export function itemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id)
}

interface Wallet {
  coins: number
  owned: string[]
}

/**
 * Tente d'acheter un article : renvoie le nouveau portefeuille, ou `null` si
 * l'article est inconnu, déjà possédé, ou trop cher.
 */
export function buy(wallet: Wallet, itemId: string): Wallet | null {
  const item = itemById(itemId)
  if (!item) return null
  if (wallet.owned.includes(itemId)) return null
  if (wallet.coins < item.price) return null
  return { coins: wallet.coins - item.price, owned: [...wallet.owned, itemId] }
}
