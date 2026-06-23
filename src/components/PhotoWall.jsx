import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { giftConfig } from '../data/gift.config'
import { ChevronRight } from 'lucide-react'

/**
 * 散落照片墙 —— 绝对定位铺满全屏，照片像撒在桌面上
 * 用网格散点 + 抖动算位置，均匀又不规则，避免重叠
 */
export default function PhotoWall({ onDone }) {
  const photos = giftConfig.photos
  const rootRef = useRef(null)
  const fieldRef = useRef(null)
  const cardRefs = useRef([])
  const [flipped, setFlipped] = useState(() => photos.map(() => false))
  const [viewed, setViewed] = useState(0)

  // 散落入场
  useEffect(() => {
    cardRefs.current.filter(Boolean).forEach((c, i) => {
      gsap.fromTo(
        c,
        { y: 50, opacity: 0, scale: 0.7 },
        {
          y: 0, opacity: 1, scale: 1,
          rotation: photos[i].rot || 0,
          duration: 0.6, delay: i * 0.06,
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
    <div ref={rootRef} className="relative min-h-screen w-full overflow-hidden safe-pt safe-pb">
      {/* 顶部标题（浮于照片之上） */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 pt-8 text-center safe-pt">
        <p className="text-xs tracking-[0.3em] text-white/55">MEMORIES · 那些时光</p>
        <h2 className="mt-1 text-xl font-semibold text-gradient">翻开我们的故事</h2>
      </div>

      {/* 散落照片场 —— 绝对定位铺满 */}
      <div ref={fieldRef} className="absolute inset-0">
        {photos.map((p, i) => {
          const pos = scatter(i, photos.length)
          return (
            <button
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              onClick={() => flip(i)}
              aria-label={`照片 ${i + 1}`}
              className="absolute z-10 cursor-pointer"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: '64px',
                transform: `translate(-50%, -50%) rotate(${p.rot || 0}deg)`,
              }}
            >
              <div className="relative" style={{ perspective: '600px' }}>
                {/* 正面 */}
                <div
                  className="relative rounded-[3px] bg-white p-1 pb-4 shadow-lg transition-transform duration-500"
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
                  <p className="mt-0.5 text-center text-[7px] leading-tight text-gray-700">{p.caption}</p>
                </div>
                {/* 背面 */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-[3px] bg-gradient-to-br from-blossom/95 to-skyblue/95 p-1.5 text-center shadow-lg transition-transform duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: flipped[i] ? 'none' : 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <p className="font-serif text-[7px] leading-snug text-white/95">{p.note}</p>
                  <p className="mt-1 text-[6px] tracking-wider text-white/70">{p.date}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 底部提示 + 继续 */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-2 pb-6 safe-pb">
        <p className="text-xs text-white/50">
          {allViewed ? '都翻过啦，准备好继续了吗' : `点照片翻看 · ${viewed}/${photos.length}`}
        </p>
        <button
          onClick={() => onDone && onDone()}
          className={`pointer-events-auto flex items-center gap-1 rounded-full glass px-5 py-2 text-xs transition-all ${
            allViewed ? 'text-petal hover:scale-105' : 'text-white/60 hover:text-white/90'
          }`}
        >
          继续往下 <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

/**
 * 散点布局：把 n 张照片均匀又不规则地撒在 0-100% 画布上
 * 用多层偏移网格 + 抖动，避免重叠
 */
function scatter(i, total) {
  // 列数随总数自适应，26 张用 6 列
  const cols = Math.ceil(Math.sqrt(total * 1.3))
  const rows = Math.ceil(total / cols)
  const col = i % cols
  const row = Math.floor(i / cols)
  // 网格中心
  const cellW = 100 / cols
  const cellH = 92 / rows // 留出顶部标题和底部按钮空间
  const baseX = col * cellW + cellW / 2
  const baseY = row * cellH + cellH / 2 + 6 // 顶部留 6% 给标题
  // 伪随机抖动（基于 i 稳定，不随重渲染变）
  const seed = (i * 9301 + 49297) % 233280
  const rnd1 = (seed / 233280) - 0.5
  const rnd2 = ((seed * 7) % 233280 / 233280) - 0.5
  const jitterX = rnd1 * cellW * 0.6
  const jitterY = rnd2 * cellH * 0.5
  return {
    x: Math.max(6, Math.min(94, baseX + jitterX)),
    y: Math.max(8, Math.min(90, baseY + jitterY)),
  }
}
