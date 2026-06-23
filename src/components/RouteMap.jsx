import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { giftConfig } from '../data/gift.config'

// 城市在 SVG 上的坐标（按真实经纬度相对位置：成都在西南，南京·南通在长三角）
const COORDS = {
  shipped: { x: 54, y: 176 },
  transit: { x: 262, y: 110 },
  arrived: { x: 296, y: 116 },
}
// 折线路径上各城市进度：成都=0，南通=1，南京≈两段接点
const T = { shipped: 0, transit: 0.88, arrived: 1 }

/**
 * 极简物流地图：三个城市按真实相对位置落点，虚线连接，
 * 一个光点沿路径移动，随 active 段推进到达对应城市。
 * @param {number} active 当前物流段（0/1/2，≥length 视为已送达）
 */
export default function RouteMap({ active }) {
  const pathRef = useRef(null)
  const dotRef = useRef(null)
  const stages = giftConfig.stages
  const pts = stages.map((s) => COORDS[s.key]).filter(Boolean)
  const d =
    pts.length >= 2
      ? `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
      : ''
  const start = pts[0] || { x: 0, y: 0 }

  useEffect(() => {
    const path = pathRef.current
    const dot = dotRef.current
    if (!path || !dot) return
    const total = path.getTotalLength()
    const idx = Math.min(Math.max(active, 0), stages.length - 1)
    const target = T[stages[idx]?.key] ?? 0
    const obj = { p: dot.dataset.p != null ? +dot.dataset.p : 0 }
    gsap.to(obj, {
      p: target,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        const pt = path.getPointAtLength(obj.p * total)
        dot.setAttribute('transform', `translate(${pt.x},${pt.y})`)
        dot.dataset.p = obj.p
      },
    })
  }, [active, stages])

  return (
    <svg viewBox="0 0 360 250" className="mx-auto w-full max-w-md" aria-hidden="true">
      <defs>
        <pattern id="rt-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" />
        </pattern>
        <radialGradient id="rt-glow">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#ffd6e8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffd6e8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="250" fill="url(#rt-grid)" rx="18" />

      {/* 全程虚线路径 */}
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="rgba(168,200,255,0.4)"
        strokeWidth="2"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />

      {/* 城市节点 */}
      {stages.map((s, i) => {
        const c = COORDS[s.key]
        if (!c) return null
        const on = i <= active
        const name = s.city.split('·').pop().trim()
        return (
          <g key={s.key} opacity={on ? 1 : 0.35}>
            {on && <circle cx={c.x} cy={c.y} r="13" fill={s.accent} opacity="0.25" />}
            <circle
              cx={c.x}
              cy={c.y}
              r={on ? 6 : 4.5}
              fill={on ? s.accent : 'rgba(255,255,255,0.35)'}
              stroke="#fff"
              strokeWidth="1.5"
            />
            <text x={c.x} y={c.y - 15} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="600">
              {name}
            </text>
            <text x={c.x} y={c.y + 22} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="9">
              {s.status}
            </text>
          </g>
        )
      })}

      {/* 移动光点 */}
      <g ref={dotRef} transform={`translate(${start.x},${start.y})`}>
        <circle r="16" fill="url(#rt-glow)" />
        <circle r="5" fill="#fff" />
      </g>
    </svg>
  )
}
