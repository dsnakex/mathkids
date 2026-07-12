// Génère les icônes PNG de la PWA à partir de l'icône SVG source.
// À relancer si l'icône change : `npm run icons`.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'public', 'icons', 'icon.svg')
const out = join(root, 'public', 'icons')

const svg = await readFile(src)

// L'icône a un fond plein « bord à bord » : elle sert aussi de version maskable
// (le nigiri est centré, dans la zone de sécurité).
const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const { name, size } of sizes) {
  const png = await sharp(svg).resize(size, size).png().toBuffer()
  await writeFile(join(out, name), png)
  console.log(`✓ ${name} (${size}×${size})`)
}
