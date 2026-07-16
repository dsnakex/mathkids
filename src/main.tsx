import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import { applyDisplaySettings, loadDisplaySettings } from '@/app/settings'
import '@/index.css' // déclare Baloo 2 (sous-ensembles latin, self-hostée, offline)

// Réglages d'affichage (police dyslexie, texte agrandi) dès le premier rendu.
applyDisplaySettings(loadDisplaySettings())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
