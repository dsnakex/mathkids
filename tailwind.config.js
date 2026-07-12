/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Palette « Chats-Sushis » (neko-sushi) validée v2 — voir docs/DESIGN.md §2
      // et docs/design-handoff/README.md. Source unique de vérité des couleurs :
      // changer une valeur ici re-skinne toute l'app.
      colors: {
        cream: { DEFAULT: '#FCF7EE', parent: '#F6EFDD' }, // fond « riz crème »
        card: '#FFFFFF',
        ink: '#4A4038', // texte principal
        muted: { DEFAULT: '#847C6C', dark: '#5F594C' }, // texte secondaire (+ relief)
        primary: { DEFAULT: '#C25A38', dark: '#8E3F24' }, // action, saumon foncé
        gold: { DEFAULT: '#F5DFA0', text: '#6B4A0E', dark: '#C0A458' }, // riz doré, badges
        success: {
          DEFAULT: '#4E9A5F',
          soft: '#EDF5E2',
          text: '#3E6B24',
          dark: '#A9C487',
        },
        error: {
          DEFAULT: '#E2A69B', // gingembre rosé, jamais rouge agressif
          soft: '#FAECE8',
          text: '#9A5244',
          dark: '#E5C3BA',
        },
        track: { DEFAULT: '#E3D5BC', border: '#D9C9A8', fill: '#FFFDF7' }, // jauge bol de riz
        hairline: '#D3C6AC', // bordures discrètes (bouton « ajouter » en pointillés)
        prix: '#8E5A22', // prix boutique
        // Accents par niveau / monde de restaurant
        cp: '#D9704C', // Bar à sushis
        ce1: { DEFAULT: '#4E9A5F', dark: '#357043' }, // Monde des Makis
        ce2: '#8A9A2F', // Jardin à thé matcha
        cm1: '#C98A3B', // Monde des Ramens
        cm2: '#C4699E', // Grand Banquet
      },
      fontFamily: {
        // Baloo 2 self-hostée via @fontsource-variable/baloo-2 (offline).
        sans: [
          '"Baloo 2 Variable"',
          '"Baloo 2"',
          'system-ui',
          'Segoe UI',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '24px',
        'card-lg': '28px',
        btn: '24px',
        'btn-sm': '18px',
      },
      boxShadow: {
        // Relief « bonbon » : 0 5px 0 <couleur foncée> ; « -pressed » = état enfoncé.
        candy: '0 5px 0 #E8DCC4',
        'candy-pressed': '0 2px 0 #E8DCC4',
        'candy-sm': '0 4px 0 #E8DCC4',
        'candy-primary': '0 5px 0 #8E3F24',
        'candy-primary-pressed': '0 2px 0 #8E3F24',
        'candy-gold': '0 5px 0 #C0A458',
      },
    },
  },
  plugins: [],
}
