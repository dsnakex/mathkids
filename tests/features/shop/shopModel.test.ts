import { SHOP_ITEMS, buy, itemById } from '@/features/shop/shopModel'

describe('shopModel — catalogue', () => {
  it('propose des articles avec prix positifs et identifiants uniques', () => {
    expect(SHOP_ITEMS.length).toBeGreaterThan(0)
    for (const item of SHOP_ITEMS) expect(item.price).toBeGreaterThan(0)
    const ids = SHOP_ITEMS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('shopModel — achat', () => {
  const item = SHOP_ITEMS[0]

  it('débite le riz et ajoute l\'article aux possessions', () => {
    const res = buy({ coins: item.price + 5, owned: [] }, item.id)
    expect(res).not.toBeNull()
    expect(res?.coins).toBe(5)
    expect(res?.owned).toContain(item.id)
  })

  it('refuse l\'achat si le riz est insuffisant', () => {
    expect(buy({ coins: item.price - 1, owned: [] }, item.id)).toBeNull()
  })

  it('refuse d\'acheter deux fois le même article', () => {
    expect(buy({ coins: 999, owned: [item.id] }, item.id)).toBeNull()
  })

  it('refuse un identifiant d\'article inconnu', () => {
    expect(buy({ coins: 999, owned: [] }, 'article-fantome')).toBeNull()
  })

  it('itemById retrouve un article du catalogue', () => {
    expect(itemById(item.id)?.id).toBe(item.id)
    expect(itemById('inconnu')).toBeUndefined()
  })
})
