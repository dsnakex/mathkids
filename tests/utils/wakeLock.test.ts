import { requestWakeLock, wakeLockSupported } from '@/utils/wakeLock'

// Navigator factice : on ne teste pas le vrai verrou (API navigateur), mais la
// garde de support et le fallback silencieux quand l'API est absente ou refuse.
function fakeNavigator(wakeLock?: unknown): Navigator {
  return { wakeLock } as unknown as Navigator
}

describe('verrou d\'écran (Wake Lock)', () => {
  it('détecte l\'absence de l\'API (garde sûre)', () => {
    expect(wakeLockSupported(fakeNavigator(undefined))).toBe(false)
    expect(wakeLockSupported(fakeNavigator({}))).toBe(false)
  })

  it('détecte la présence de l\'API', () => {
    expect(wakeLockSupported(fakeNavigator({ request: () => Promise.resolve({}) }))).toBe(true)
  })

  it('renvoie null sans erreur quand l\'API est absente', async () => {
    await expect(requestWakeLock(fakeNavigator(undefined))).resolves.toBeNull()
  })

  it('renvoie null sans erreur quand le navigateur refuse le verrou', async () => {
    const nav = fakeNavigator({ request: () => Promise.reject(new Error('refusé')) })
    await expect(requestWakeLock(nav)).resolves.toBeNull()
  })

  it('renvoie une poignée relâchable quand le verrou est obtenu', async () => {
    let released = false
    const sentinel = {
      released: false,
      release: () => {
        released = true
        return Promise.resolve()
      },
    }
    const nav = fakeNavigator({ request: () => Promise.resolve(sentinel) })
    const handle = await requestWakeLock(nav)
    expect(handle).not.toBeNull()
    await handle?.release()
    expect(released).toBe(true)
  })
})
