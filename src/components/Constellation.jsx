import { useState } from 'react'
import { giftConfig } from '../data/gift.config'

/**
 * 星座连线 —— 按顺序点亮星点，连成心形后揭晓一句话
 */
export default function Constellation() {
  const cfg = giftConfig.constellation
  const stars = cfg.stars
  const [next, setNext] = useState(0)
  const done = next >= stars.length

  const tap = (i) => {
    if (done) return
    if (i === next) setNext(next + 1)
  }

  const lines = []
  for (let k = 0; k < next - 1; k++) {
    lines.push([stars[k], stars[k + 1]])
  }
  if (done) lines.push([stars[stars.length - 1], stars[0]])

  return (
    <div className="mt-6 w-full">
      <p className={`mb-3 text-center text-xs transition-colors ${done ? 'text-warmgold' : 'text-white/55'}`}>
        {done ? cfg.reveal : cfg.hint}
        {done && ` · ${next}/${stars.length}`}
      </p>
      <div className="relative mx-auto aspect-square w-full max-w-[16rem]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {lines.map(([a, b], i) => (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="#ffd6e8" strokeWidth="0.7" strokeLinecap="round" opacity="0.9" />
          ))}
          {stars.map((s, i) => {
            const lit = i < next
            return (
              <g key={i}>
                <circle cx={s.x} cy={s.y} r="6" fill="transparent"
                  style={{ cursor: done ? 'default' : 'pointer', pointerEvents: 'all' }}
                  onClick={() => tap(i)} />
                <circle cx={s.x} cy={s.y} r={lit ? 1.8 : 1.2}
                  fill={lit ? '#ffd27a' : 'rgba(255,255,255,0.55)'}
                  style={{ transition: 'all 0.3s', filter: lit ? 'drop-shadow(0 0 3px #ffd27a)' : 'none' }} />
              </g>
            )
          })}
        </svg>
      </div>
      {!done && next > 0 && (
        <p className="mt-2 text-center text-[10px] text-white/40">已点亮 {next} / {stars.length}</p>
      )}
    </div>
  )
}
