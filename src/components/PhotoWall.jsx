import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { giftConfig } from '../data/gift.config'
import GlassCard from './GlassCard'
import { ChevronRight } from 'lucide-react'

/**
 * 散落 Polaroid 照片墙
 * - 照片从拆包裹自然延伸：散落飘入 + 点击翻转看背面文字
 * - 任意位置可放任意张，自适应数量
 * @param {function} onDone  看完进入下一幕
 */
export default function PhotoWall({ onDone }) {
  const photos = giftConfig.photos
  const rootRef = useRef(null)
  const cardRefs = useRef([])
  const [flipped, setFlipped] = useState(() => photos.map(() => false))
  const [viewed, setViewed] = useState(0)

  // 散落入场
  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      cardRefs.current.filter(Boolean).forEach((c, i) => {
        gsap.fromTo(
          c,
          { y: 60, opacity: 0, rotation: 0, scale: 0.8 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotation: photos[i].rot || 0,
            duration: 0.7,
            delay: i * 0.15,
            ease: 'back.out(1.4)',
          }
        )
      })
    })
    return () => ctx.revert()
  }, [photos])

  const flip = (i) => {
    setFlipped((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      // 翻过就算看过一张
      if (next[i] && !prev[i]) setViewed((v) => v + 1)
      return next
    })
  }

  const allViewed = viewed >= photos.length

  return (
    <div ref={rootRef} className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-5 pt-12 pb-28 safe-pt safe-pb">
      <div className="mb-8 text-center">
        <p className="text-xs tracking-[0.3em] text-white/55">MEMORIES · 那些时光</p>
        <h2 className="mt-2 text-2xl font-semibold text-gradient">翻开我们的故事</h2>
        <p className="mt-2 text-xs text-white/50">点一下照片，翻到背面看看</p>
      </div>

      {/* 散落照片：多列瀑布流 + 交替偏移与旋转 */}
      <div className="columns-2 gap-3 sm:columns-3">
        {photos.map((p, i) => (
          <button
            key={i}
            ref={(el) => (cardRefs.current[i] = el)}
            onClick={() => flip(i)}
            aria-label={`照片 ${i + 1}`}
            className="group relative mb-4 block w-full break-inside-avoid cursor-pointer"
            style={{
              perspective: '1000px',
              transform: `rotate(${p.rot || 0}deg)`,
              marginLeft: i % 2 === 0 ? '0' : '12px',
            }}
          >
            <div className="relative w-full" style={{ perspective: '1000px' }}>
              {/* 正面：照片 */}
              <div
                className="relative w-full rounded-sm bg-white p-2 pb-7 shadow-xl transition-transform duration-500"
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
                {p.caption && (
                  <p className="mt-1 text-center text-[10px] text-gray-700">{p.caption}</p>
                )}
              </div>
              {/* 背面：文字 */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-sm bg-gradient-to-br from-blossom/90 to-skyblue/90 p-3 text-center shadow-xl transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped[i] ? 'none' : 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <p className="font-serif text-[11px] leading-relaxed text-white/95">{p.note}</p>
                {p.date && (
                  <p className="mt-2 text-[9px] tracking-wider text-white/70">{p.date}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 进度提示 */}
      <p className="mt-8 text-xs text-white/45">
        {allViewed ? '都翻过啦，准备好继续了吗' : `已翻看 ${viewed} / ${photos.length} 张`}
      </p>

      {/* 继续按钮 */}
      <button
        onClick={() => onDone && onDone()}
        className={`mt-4 flex items-center gap-1 rounded-full glass px-6 py-2.5 text-sm transition-all ${
          allViewed
            ? 'text-petal hover:scale-105'
            : 'text-white/60 hover:text-white/90'
        }`}
      >
        继续往下
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
