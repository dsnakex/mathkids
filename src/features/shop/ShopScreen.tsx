// Boutique « Le comptoir du chef » (handoff écran 6). On dépense le riz doré
// gagné en jouant pour personnaliser son avatar. Aucun achat réel.

import { useAppStore } from '@/app/store'
import { Button } from '@/components/Button'
import { NekoSushi } from '@/components/NekoSushi'
import { SHOP_ITEMS, type ShopCategory, type ShopItem } from './shopModel'

const SECTIONS: Array<{ cat: ShopCategory; title: string }> = [
  { cat: 'garniture', title: 'Garnitures' },
  { cat: 'accessoire', title: 'Accessoires' },
  { cat: 'fond', title: "Fonds d'écran" },
]

function ItemCard({
  item,
  owned,
  coins,
  onBuy,
}: {
  item: ShopItem
  owned: boolean
  coins: number
  onBuy: (id: string) => void
}) {
  const affordable = coins >= item.price
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-card border-[3px] bg-card p-3 text-center shadow-candy-sm ${
        owned ? 'border-success' : 'border-transparent'
      }`}
    >
      <span aria-hidden="true" className="text-[34px] leading-none">
        {item.emoji}
      </span>
      <span className="text-sm font-extrabold text-ink">{item.label}</span>
      {owned ? (
        <span className="text-sm font-bold text-success-text">Possédé ✔</span>
      ) : (
        <button
          type="button"
          disabled={!affordable}
          onClick={() => onBuy(item.id)}
          className="rounded-btn-sm bg-gold px-3 py-1 text-sm font-extrabold text-prix shadow-candy-gold transition-transform active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-50"
        >
          🍚 {item.price}
        </button>
      )}
    </div>
  )
}

export function ShopScreen() {
  const profiles = useAppStore((s) => s.profiles)
  const profileId = useAppStore((s) => s.profileId)
  const buyItem = useAppStore((s) => s.buyItem)
  const goMap = useAppStore((s) => s.goMap)

  const profile = profiles.find((p) => p.id === profileId)
  const coins = profile?.coins ?? 0
  const owned = new Set(profile?.owned ?? [])

  return (
    <main className="flex min-h-full flex-col gap-4 bg-cream p-5 font-sans text-ink">
      <header className="flex items-center gap-2">
        <h1 className="text-[22px] font-extrabold">Le comptoir du chef</h1>
        <span className="ml-auto rounded-full bg-gold px-3 py-1 text-base font-extrabold text-gold-text">
          🍚 {coins}
        </span>
      </header>

      <div className="flex items-center gap-3 rounded-card bg-card p-3 shadow-candy-sm">
        <NekoSushi variant={profile?.character ?? 'maki'} size={64} />
        <div>
          <p className="text-lg font-extrabold">{profile?.name}</p>
          <p className="text-sm font-bold text-muted">
            {owned.size} objet{owned.size > 1 ? 's' : ''} de collection
          </p>
        </div>
      </div>

      {SECTIONS.map(({ cat, title }) => (
        <section key={cat}>
          <h2 className="mb-2 text-lg font-extrabold">{title}</h2>
          <div className="grid grid-cols-3 gap-3">
            {SHOP_ITEMS.filter((i) => i.category === cat).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                owned={owned.has(item.id)}
                coins={coins}
                onBuy={buyItem}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="mt-2">
        <Button variant="ghost" onClick={goMap}>
          Retour à la carte 🥢
        </Button>
      </div>
    </main>
  )
}
