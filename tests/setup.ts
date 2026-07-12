import '@testing-library/jest-dom'
// IndexedDB n'existe pas dans jsdom : on fournit une implémentation en mémoire
// pour que la couche Dexie (src/db) fonctionne dans les tests.
import 'fake-indexeddb/auto'
