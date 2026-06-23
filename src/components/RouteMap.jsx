import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { giftConfig } from '../data/gift.config'

// 城市经纬度，按真实位置映射到 SVG 坐标
const LNG_LAT = {
  '成都': [104.07, 30.67],
  '重庆': [106.55, 29.56],
  '武汉': [114.31, 30.59],
  '合肥': [117.27, 31.86],
  '南京': [118.80, 32.06],
  '南通': [120.86, 32.01],
}
const cityName = (s) => s.city.split('·').pop().trim()

const PAD = 38
const W = 360
const H = 250
const LNG = [103.5, 121.5]
const LAT = [29.0, 32.6]
const project = (lng, lat) => ({
  x: PAD + ((lng - LNG[0]) / (LNG[1] - LNG[0])) * (W - PAD * 2),
  // 纬度上小下大，SVG y 轴下大，取反
  y: PAD + ((LAT[1] - lat) / (LAT[1] - LAT[0])) * (H - PAD * 2),
})

/**
 * 物流地图：城市按真实经纬度落点，虚线连接，
 * 一个光点沿路径移动，随 active 段推进到达对应城市。
 * 段数不限，坐标与进度自动计算。
 * @param {number} active 当前物流段索引
 */
export default function RouteMap({ active }) {
  const pathRef = useRef(null)
  const dotRef = useRef(null)
  const stages = giftConfig.stages

  const pts = stages.map((s) => {
    const c = LNG_LAT[cityName(s)]
    return c ? project(c[0], c[1]) : null
  }).filter(Boolean)
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
    // 进度按段数均分：第 i 段 -> i/(n-1)
    const idx = Math.min(Math.max(active, 0), stages.length - 1)
    const target = stages.length > 1 ? idx / (stages.length - 1) : 0
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
        const c = pts[i]
        if (!c) return null
        const on = i <= active
        const name = cityName(s)
        // 相邻城市文字上下交替，避免重叠
        const labelAbove = i % 2 === 0
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
            <text x={c.x} y={c.y + (labelAbove ? -15 : -4)} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">
              {name}
            </text>
            <text x={c.x} y={c.y + (labelAbove ? 22 : 14)} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="9">
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
