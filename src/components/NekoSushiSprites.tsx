import spriteSheet from '@/assets/neko-sushi-sprites.svg?raw'

// Feuille de sprites des personnages chats-sushis : injecte une fois dans le DOM
// les dégradés et les <symbol> (ns-chef, ns-maki…). Les instances <NekoSushi>
// y font référence via <use href="#ns-…">. À monter une seule fois, à la racine.
export function NekoSushiSprites() {
  return <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: spriteSheet }} />
}
