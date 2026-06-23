import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { giftConfig } from '../data/gift.config'
import { ChevronRight } from 'lucide-react'

/**
 * 散落照片墙 —— 真正的绝对定位随机散落
 * 每张照片位置用最小间距算法生成，像撒在桌面上
 */
export default function PhotoWall({ onDone }) {
  const photos = giftConfig.photos
  const rootRef = useRef(null)
  const cardRefs = useRef([])
  const [flipped, setFlipped] = useState(() => photos.map(() => false))
  const [viewed, setViewed] = useState(0)

  // 视口宽度,resize 时重算布局
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 375)
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const layout = useMemo(() => scatterLayout(photos.length, vw), [photos.length, vw])

  useEffect(() => {
    cardRefs.current.filter(Boolean).forEach((c, i) => {
      gsap.fromTo(
        c,
        { y: 60, opacity: 0, scale: 0.7, rotation: 0 },
        {
          y: 0, opacity: 1, scale: 1,
          rotation: photos[i].rot || 0,
          duration: 0.6, delay: i * 0.05,
          ease: 'back.out(1.4)',
        }
      )
    })
  }, [photos])

  const flip = (i) => {
    setFlipped((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      if (next[i] && !prev[i]) setViewed((v) => v + 1)
      return next
    })
  }
  const allViewed = viewed >= photos.length

  const months = useMemo(() => {
    const set = new Set(photos.map((p) => p.date.slice(0, 7)))
    return [...set].sort()
  }, [photos])
  const monthIdxOf = (p) => months.indexOf(p.date.slice(0, 7))
  const [timeIdx, setTimeIdx] = useState(months.length - 1)
  const visibleCount = photos.filter((p) => monthIdxOf(p) <= timeIdx).length
  const [cy, cm] = (months[timeIdx] || '').split('-')
  const curLabel = `${cy}年 ${+cm}月`

  return (
    <div ref={rootRef} className="relative w-full overflow-y-auto safe-pt safe-pb">
      {/* 顶部标题 */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 pt-8 text-center safe-pt">
        <p className="text-xs tracking-[0.3em] text-white/55">MEMORIES · 那些时光</p>
        <h2 className="mt-1 text-xl font-semibold text-gradient">{giftConfig.photoWallTitle}</h2>
      </div>

      {/* 散落照片场 */}
      <div className="relative w-full" style={{ height: `${layout.height}px` }}>
        {photos.map((p, i) => {
          const pos = layout.positions[i]
          return (
            <button
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              onClick={() => flip(i)}
              aria-label={`照片 ${i + 1}`}
              className="absolute z-10 cursor-pointer"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}px`,
                transform: `translateX(-50%) rotate(${p.rot || 0}deg)`,
                pointerEvents: monthIdxOf(p) <= timeIdx ? 'auto' : 'none',
              }}
            >
              <div
                className="relative transition-opacity duration-300"
                style={{ perspective: '1000px', opacity: monthIdxOf(p) <= timeIdx ? 1 : 0.12 }}
              >
                {/* 正面 */}
                <div
                  className="relative rounded-sm bg-white p-2 pb-7 shadow-xl transition-transform duration-500"
                  style={{
                    width: `${layout.cardW}px`,
                    transformStyle: 'preserve-3d',
                    transform: flipped[i] ? 'rotateY(180deg)' : 'none',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-gray-200">
                    <img
                      src={p.src}
                      alt={p.caption || `照片 ${i + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      draggable="false"
                    />
                  </div>
                  <p className="mt-1 text-center text-[10px] text-gray-700">{p.caption}</p>
                </div>
                {/* 背面 */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-sm bg-gradient-to-br from-blossom/90 to-skyblue/90 p-3 text-center shadow-xl transition-transform duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: flipped[i] ? 'none' : 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <p className="font-serif text-[11px] leading-relaxed text-white/95">{p.note}</p>
                  <p className="mt-2 text-[9px] tracking-wider text-white/70">{p.date}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 时间轴 + 底部继续 */}
      <div className="sticky bottom-3 z-20 mx-auto mt-4 w-full max-w-md px-4">
        <div className="glass rounded-2xl px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/65">
            <span>倒带 · {curLabel}</span>
            <span>{visibleCount}/{photos.length}</span>
          </div>
          <input
            type="range"
            min={0}
            max={months.length - 1}
            value={timeIdx}
            onChange={(e) => setTimeIdx(+e.target.value)}
            className="w-full accent-[#f9b8d4]"
            aria-label="时间轴"
          />
          <div className="mt-3 flex flex-col items-center gap-2">
            <p className="text-xs text-white/50">
              {allViewed ? '都翻过啦，准备好继续了吗' : `点照片翻看 · ${viewed}/${photos.length}`}
            </p>
            <button
              onClick={() => onDone && onDone()}
              className={`flex items-center gap-1 rounded-full glass px-6 py-2.5 text-sm transition-all ${
                allViewed ? 'text-petal hover:scale-105' : 'text-white/60 hover:text-white/90'
              }`}
            >
              继续往下 <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 散落布局算法
 * 在容器宽度内随机放置每张照片，保证最小间距不重叠
 * 伪随机种子基于索引，结果稳定
 */
function scatterLayout(count, vw) {
  const cardW = vw < 480 ? 104 : 128
  const cardH = vw < 480 ? 156 : 200
  // 两侧最小留白：保证卡片中心距边缘 ≥ cardW/2 + 8，避免溢出被裁
  const halfPct = ((cardW / 2 + 8) / vw) * 100
  let perRow = Math.max(2, Math.floor((vw - 16) / (cardW + 14)))
  perRow = Math.min(perRow, 6)
  const rows = Math.ceil(count / perRow)
  const rowH = cardH + 56
  const positions = []

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    const denom = Math.max(1, perRow - 1)
    const baseX = halfPct + (col / denom) * (100 - halfPct * 2)
    const baseY = 96 + row * rowH
    // 稳定伪随机抖动（仅 y 方向，x 保持网格不溢出）
    const seed = (i * 9301 + 49297) % 233280
    const jy = (((seed * 7) % 233280) / 233280 - 0.5) * 28
    positions.push({ x: baseX, y: baseY + jy })
  }

  const height = rows * rowH + 140
  return { positions, height, cardW }
}
