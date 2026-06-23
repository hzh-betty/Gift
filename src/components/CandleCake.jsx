import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { giftConfig } from '../data/gift.config'

/**
 * 蛋糕 + 可吹蜡烛
 * - 点击任意蜡烛熄灭
 * - 全部熄灭后触发烟花，并显示「愿望已生效」
 * @param {function} onAllOut  全熄回调
 */
export default function CandleCake({ onAllOut }) {
  const CANDLES = 3
  const [out, setOut] = useState(() => Array(CANDLES).fill(false))
  const outRef = useRef(Array(CANDLES).fill(false))
  const flameRefs = useRef([])
  const flickerTweens = useRef([])
  const cakeRef = useRef(null)
  const doneRef = useRef(false)

  // 蛋糕入场
  useEffect(() => {
    if (!cakeRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cakeRef.current,
        { scale: 0.6, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.9, ease: 'back.out(1.6)' }
      )
      // 火焰 flicker（记录以便熄灭时 kill）
      flickerTweens.current = flameRefs.current
        .filter(Boolean)
        .map((f) =>
          gsap.to(f, {
            scaleY: 0.85,
            scaleX: 1.1,
            duration: 0.16 + Math.random() * 0.06,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })
        )
    })
    return () => ctx.revert()
  }, [])

  const blow = (i) => {
    if (outRef.current[i]) return
    outRef.current[i] = true
    setOut((prev) => {
      const next = [...prev]
      next[i] = true
      return next
    })

    const f = flameRefs.current[i]
    if (f) {
      // 停掉该火焰的 flicker，避免与熄灭补丁冲突
      flickerTweens.current[i] && flickerTweens.current[i].kill()
      gsap.to(f, {
        scaleY: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        overwrite: true,
      })
      // 一缕烟
      const smoke = document.createElement('span')
      smoke.style.cssText =
        'position:absolute;left:50%;top:0;width:6px;height:18px;border-radius:50%;background:rgba(255,255,255,0.35);filter:blur(3px);transform:translate(-50%,-100%);pointer-events:none;'
      f.parentElement.appendChild(smoke)
      gsap.to(smoke, {
        y: -40,
        opacity: 0,
        duration: 1.2,
        ease: 'power1.out',
        onComplete: () => smoke.remove(),
      })
    }

    // 全熄
    if (outRef.current.every(Boolean) && !doneRef.current) {
      doneRef.current = true
      setTimeout(() => onAllOut && onAllOut(), 300)
    }
  }

  const allOut = out.every(Boolean)

  return (
    <div ref={cakeRef} className="flex flex-col items-center select-none">
      {/* 蜡烛层 */}
      <div className="relative flex items-end justify-center gap-3">
        {out.map((isOut, i) => (
          <button
            key={i}
            onClick={() => blow(i)}
            aria-label={`蜡烛 ${i + 1}`}
            className="relative flex h-20 w-3 cursor-pointer flex-col items-center"
          >
            {/* 火焰 */}
            <span
              ref={(el) => (flameRefs.current[i] = el)}
              className="relative mb-0 h-5 w-3 origin-bottom rounded-full"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 70%, #fff3b0 0%, #ffd27a 40%, #ff9d5c 75%, rgba(255,120,80,0) 100%)',
                filter: 'drop-shadow(0 0 8px rgba(255,210,122,0.95))',
                opacity: isOut ? 0 : 1,
              }}
            >
              <span className="absolute left-1/2 top-1 h-2 w-1 -translate-x-1/2 rounded-full bg-white/85" />
            </span>
            {/* 烛身 */}
            <span
              className="h-14 w-2 rounded-sm"
              style={{
                background:
                  i % 2 === 0
                    ? 'linear-gradient(180deg,#ffd6e8,#f9b8d4)'
                    : 'linear-gradient(180deg,#a8c8ff,#8aa6ff)',
              }}
            />
          </button>
        ))}
      </div>

      {/* 蛋糕本体 */}
      <div className="relative -mt-1 w-48">
        {/* 顶饰 */}
        <div className="h-8 w-full rounded-t-[40%] bg-gradient-to-b from-petal to-blossom" />
        {/* 奶油波浪 */}
        <div className="flex h-3 w-full items-start justify-around bg-petal">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-full bg-white/80"
              style={{ marginTop: -4 }}
            />
          ))}
        </div>
        {/* 主体 */}
        <div className="relative h-16 w-full bg-gradient-to-b from-skyblue/90 to-[#7a9be8]">
          <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(90deg,transparent_0_10px,rgba(255,255,255,0.4)_10px_12px)]" />
        </div>
        {/* 底盘 */}
        <div className="h-3 w-[110%] -ml-[5%] rounded-md bg-white/30 backdrop-blur" />
      </div>

      <p
        className={`mt-5 text-sm transition-opacity duration-500 ${
          allOut ? 'text-warmgold' : 'text-white/75'
        }`}
      >
        {allOut ? giftConfig.candleDone : giftConfig.cakeCaption}
      </p>
    </div>
  )
}
