// Lecture audio des consignes via la Web Speech API (SpeechSynthesis), en
// français. Aucun fichier audio : la voix vient du navigateur, donc l'app reste
// 100 % offline et légère. Fonction tolérante : ne fait rien si l'API est
// absente (certains navigateurs, environnement de test).

export function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const synth = window.speechSynthesis
  synth.cancel() // coupe une lecture en cours avant d'enchaîner
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  utterance.rate = 0.95 // un peu plus lent pour de jeunes enfants
  synth.speak(utterance)
}

/** Coupe toute lecture en cours (ex. en quittant l'écran). */
export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
}
