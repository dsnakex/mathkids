/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Palette « Nature / aventure » validée — voir docs/DESIGN.md §2
      // et docs/design-handoff/README.md (design tokens).
      colors: {
        sand: { DEFAULT: '#F7F1E1', dark: '#F1EAD6' },
        card: { DEFAULT: '#FDFAF0', alt: '#FBF6E8' },
        ink: '#2C3A2E',
        muted: '#7C755F',
        primary: { DEFAULT: '#2E7D5B', dark: '#1D5940' },
        gold: { DEFAULT: '#E9B44C', dark: '#B8842A' },
        success: { DEFAULT: '#5F9E38', dark: '#A9C487' },
        error: { DEFAULT: '#DA9078', dark: '#E0BAA8' },
        track: '#E5DCC3',
        locked: '#CFC7B0',
        // Accent par niveau scolaire (l'enfant reconnaît « son île »)
        cp: '#5F9E38',
        ce1: '#C96F3B',
        ce2: '#7D5BA6',
        cm1: '#1E8E9E',
        cm2: '#B4527A',
      },
      fontFamily: {
        // Baloo 2 sera self-hébergée en Phase 1 (design). En attendant,
        // repli sur une police système arrondie et lisible.
        sans: ['"Baloo 2"', 'system-ui', 'Avenir', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
        btn: '20px',
      },
      boxShadow: {
        // Relief « bonbon » : 0 5px 0 <couleur foncée>
        candy: '0 5px 0 #D9CEAE',
        'candy-primary': '0 5px 0 #1D5940',
        'candy-gold': '0 5px 0 #B8842A',
      },
    },
  },
  plugins: [],
}
