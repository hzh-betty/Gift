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
                left: `${pos.x}%`,
                top: `${pos.y}px`,
                transform: `translateX(-50%) rotate(${p.rot || 0}deg)`,
              }}
            >
              <div className="relative" style={{ perspective: '1000px' }}>
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
function scatterLayout(count, vw) {
  // 卡片宽度:手机 110px,宽屏 128px
  const cardW = vw < 480 ? 110 : 128
  const cardH = vw < 480 ? 165 : 200
  // 每行张数:基于视口宽度自适应,保证不重叠
  // 间距 = (vw - perRow*cardW) / (perRow+1),至少留 12px 间隙
  let perRow = Math.max(2, Math.floor((vw - 24) / (cardW + 12)))
  perRow = Math.min(perRow, 6) // 最多 6 列
  const rows = Math.ceil(count / perRow)
  const rowH = cardH + 50 // 行间距留错落余量
  const positions = []

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    // 基础 x:均匀分布到两侧留白
    const padX = 12 // 两侧最小留白 %
    const baseX = padX + (col / Math.max(1, perRow - 1)) * (100 - padX * 2)
    // 基础 y:行间距 + 顶部标题留白
    const baseY = 90 + row * rowH
    // 稳定伪随机抖动
    const seed = (i * 9301 + 49297) % 233280
    const jx = ((seed / 233280) - 0.5) * 10 // x ±5%
    const jy = (((seed * 7) % 233280) / 233280 - 0.5) * 50 // y ±25px

    positions.push({
      x: Math.max(6, Math.min(94, baseX + jx)),
      y: baseY + jy,
    })
  }

  const height = rows * rowH + 120
  return { positions, height, cardW }
}
