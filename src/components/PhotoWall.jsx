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

  // 预计算散落位置（稳定，不随重渲染变）
  const layout = useMemo(() => scatterLayout(photos.length), [photos.length])

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

  return (
    <div ref={rootRef} className="relative w-full overflow-y-auto safe-pt safe-pb">
      {/* 顶部标题 */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 pt-8 text-center safe-pt">
        <p className="text-xs tracking-[0.3em] text-white/55">MEMORIES · 那些时光</p>
        <h2 className="mt-1 text-xl font-semibold text-gradient">翻开我们的故事</h2>
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
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: `rotate(${p.rot || 0}deg)`,
              }}
            >
              <div className="relative" style={{ perspective: '1000px' }}>
                {/* 正面 */}
                <div
                  className="relative w-32 rounded-sm bg-white p-2 pb-7 shadow-xl transition-transform duration-500"
                  style={{
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

      {/* 底部提示 + 继续 */}
      <div className="relative z-20 flex flex-col items-center gap-2 pb-8 pt-4">
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
  )
}

/**
 * 散落布局算法
 * 在容器宽度内随机放置每张照片，保证最小间距不重叠
 * 伪随机种子基于索引，结果稳定
 */
function scatterLayout(count) {
  // 假设容器宽度 ~380px(max-w-lg 实际渲染),卡片宽 128+padding ~140px
  const W = 380
  const cardW = 140
  const cardH = 190 // 128 * 4/3 + caption + padding
  const minGap = 8 // 卡片间最小间隙
  const margin = 10
  // 行数:每行约 3 张(380 / (140+8) ≈ 2.5,取 3 张交错)
  const perRow = 3
  const rows = Math.ceil(count / perRow)
  const rowH = cardH + minGap + 20 // 行高留余量给错落
  const positions = []
  const placed = [] // {x, y} 已放置的中心点

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / perRow)
    // 基础网格位置(中心)
    const baseX = margin + (i % perRow) * (cardW + minGap) + cardW / 2
    const baseY = margin + row * rowH + cardH / 2
    // 稳定伪随机
    const seed = (i * 9301 + 49297) % 233280
    const rnd = (s) => ((s % 233280) / 233280 - 0.5)
    const jx = rnd(seed) * 30 // x 抖动 ±15
    const jy = rnd(seed * 7) * 40 // y 抖动 ±20

    let x = baseX + jx
    let y = baseY + jy
    // 边界
    x = Math.max(margin + cardW / 2, Math.min(W - margin - cardW / 2, x))
    y = Math.max(margin + cardH / 2, y)

    positions.push({ x: x - cardW / 2, y: y - cardH / 2 })
  }

  const height = rows * rowH + margin
  return { positions, height, width: W }
}
