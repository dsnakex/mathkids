// Confettis de bonne réponse (décoratifs). Chute + rotation via l'animation
// mkfall (index.css). Purement visuel : aria-hidden, figé si l'utilisateur a
// demandé la réduction des animations (classe .mk-fall gérée en CSS).

const PIECES = [
  { left: '8%', color: '#F5DFA0', round: false, dur: '3.2s', delay: '0s' },
  { left: '88%', color: '#4E9A5F', round: true, dur: '2.7s', delay: '-1.1s' },
  { left: '24%', color: '#F0977C', round: false, dur: '3.6s', delay: '-2.2s' },
  { left: '78%', color: '#C4699E', round: false, dur: '2.9s', delay: '-0.6s' },
  { left: '52%', color: '#C98A3B', round: true, dur: '3.4s', delay: '-1.7s' },
  { left: '38%', color: '#8FBF6B', round: false, dur: '3.8s', delay: '-0.9s' },
  { left: '66%', color: '#F5DFA0', round: false, dur: '3.3s', delay: '-2.9s' },
  { left: '31%', color: '#E2A69B', round: true, dur: '3s', delay: '-1.4s' },
]

export function Confetti() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-card-lg"
    >
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="mk-fall absolute top-[-20px] h-2.5 w-2.5"
          style={{
            left: p.left,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : '3px',
            animation: `mkfall ${p.dur} linear infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}
