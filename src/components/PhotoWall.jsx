import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { giftConfig } from '../data/gift.config'
import { ChevronRight } from 'lucide-react'

/**
 * 散落 Polaroid 照片墙
 * - 瀑布流布局 + 旋转角度，散落自然
 * - 点击翻转看背面文字
 * @param {function} onDone  看完进入下一幕
 */
export default function PhotoWall({ onDone }) {
  const photos = giftConfig.photos
  const rootRef = useRef(null)
  const cardRefs = useRef([])
  const [flipped, setFlipped] = useState(() => photos.map(() => false))
  const [viewed, setViewed] = useState(0)

  useEffect(() => {
    cardRefs.current.filter(Boolean).forEach((c, i) => {
      gsap.fromTo(
        c,
        { y: 50, opacity: 0, scale: 0.8 },
        {
          y: 0, opacity: 1, scale: 1,
          rotation: photos[i].rot || 0,
          duration: 0.7, delay: i * 0.08,
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
    <div ref={rootRef} className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center px-4 pt-12 pb-28 safe-pt safe-pb">
      <div className="mb-8 text-center">
        <p className="text-xs tracking-[0.3em] text-white/55">MEMORIES · 那些时光</p>
        <h2 className="mt-2 text-2xl font-semibold text-gradient">翻开我们的故事</h2>
        <p className="mt-2 text-xs text-white/50">点一下照片，翻到背面看看</p>
      </div>

      {/* 散落照片：瀑布流 + 旋转 */}
      <div className="columns-2 gap-4 sm:columns-3">
        {photos.map((p, i) => (
          <button
            key={i}
            ref={(el) => (cardRefs.current[i] = el)}
            onClick={() => flip(i)}
            aria-label={`照片 ${i + 1}`}
            className="mb-5 block w-full break-inside-avoid cursor-pointer"
          >
            <div className="relative" style={{ perspective: '1000px' }}>
              {/* 正面 */}
              <div
                className="relative rounded-sm bg-white p-2 pb-8 shadow-xl transition-transform duration-500"
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
                <p className="mt-1.5 text-center text-[11px] text-gray-700">{p.caption}</p>
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
        ))}
      </div>

      {/* 进度提示 */}
      <p className="mt-6 text-xs text-white/45">
        {allViewed ? '都翻过啦，准备好继续了吗' : `已翻看 ${viewed} / ${photos.length} 张`}
      </p>

      {/* 继续按钮 */}
      <button
        onClick={() => onDone && onDone()}
        className={`mt-4 flex items-center gap-1 rounded-full glass px-6 py-2.5 text-sm transition-all ${
          allViewed ? 'text-petal hover:scale-105' : 'text-white/60 hover:text-white/90'
        }`}
      >
        继续往下 <ChevronRight size={16} />
      </button>
    </div>
  )
}
