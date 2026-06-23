import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { giftConfig } from '../data/gift.config'
import { useCountdown } from '../hooks/useCountdown'
import GlassCard from './GlassCard'
import TypewriterText from './TypewriterText'
import CandleCake from './CandleCake'
import Signature from './Signature'
import WishingStars from './WishingStars'

/**
 * 祝福页 —— 蛋糕 + 蜡烛 + 打字机祝福 + 已陪伴天数 + 落款
 */
export default function BirthdayWishes() {
  const rootRef = useRef(null)
  const [candlesOut, setCandlesOut] = useState(false)
  const [wishStart, setWishStart] = useState(false)
  const [showSign, setShowSign] = useState(false)
  const countdown = useCountdown(giftConfig.birthday)

  // 入场
  useEffect(() => {
    if (!rootRef.current) return
    gsap.fromTo(
      rootRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' }
    )
    // 蛋糕出现后稍延迟开始打字机
    const t = setTimeout(() => setWishStart(true), 1400)
    return () => clearTimeout(t)
  }, [])

  const handleAllOut = () => {
    setCandlesOut(true)
    // 蛋糕上方来一波爱心
    if (window.__heartBurst) {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight * 0.4
      for (let k = 0; k < 3; k++) {
        setTimeout(() => window.__heartBurst(cx + (Math.random() - 0.5) * 120, cy, 10), k * 220)
      }
    }
    // 烟花
    fireworks()
  }

  const fireworks = () => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth
        const y = Math.random() * window.innerHeight * 0.5 + 60
        burstAt(x, y)
      }, i * 320)
    }
  }

  const burstAt = (x, y) => {
    const layer = document.createElement('div')
    layer.style.cssText = 'position:fixed;inset:0;z-index:55;pointer-events:none;'
    document.body.appendChild(layer)
    const colors = ['#ffd6e8', '#a8c8ff', '#ffd27a', '#c8b6ff']
    const n = 36
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span')
      const c = colors[(Math.random() * colors.length) | 0]
      s.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:5px;height:5px;border-radius:50%;background:${c};box-shadow:0 0 8px ${c};`
      layer.appendChild(s)
      const a = (i / n) * Math.PI * 2
      const d = Math.random() * 140 + 80
      gsap.to(s, {
        x: Math.cos(a) * d,
        y: Math.sin(a) * d,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
        onComplete: () => s.remove(),
      })
    }
    setTimeout(() => layer.remove(), 1400)
  }

  return (
    <div
      ref={rootRef}
      className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-5 pt-12 pb-28 safe-pt safe-pb"
    >
      {/* 标题 */}
      <div className="text-center">
        <p className="text-xs tracking-[0.4em] text-white/60">HAPPY BIRTHDAY</p>
        <h1 className="mt-2 text-3xl font-bold text-gradient-warm">
          {giftConfig.name} · {giftConfig.age} 岁
        </h1>
        <p className="mt-2 text-xs text-white/60">{countdown.label}</p>
      </div>

      {/* 蛋糕 */}
      <div className="mt-8">
        <CandleCake onAllOut={handleAllOut} />
      </div>

      {/* 祝福卡 */}
      <GlassCard
        className="mt-10 w-full p-6 text-center"
        glow="rgba(255,214,232,0.35)"
      >
        <div className="min-h-[9.5em] text-[15px] leading-loose text-white/90">
          <TypewriterText
            lines={giftConfig.wishLines}
            speed={85}
            lineDelay={500}
            start={wishStart}
            onDone={() => setTimeout(() => setShowSign(true), 400)}
          />
        </div>

        <div
          className={`mt-5 border-t border-white/20 pt-4 text-xs text-white/70 transition-all duration-700 ${
            showSign ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
        >
          <Signature play={showSign} />
          <p className="mt-1 font-serif italic text-white/85">{giftConfig.signoff}</p>
        </div>
      </GlassCard>

      {/* 彩蛋提示 */}
      {candlesOut && (
        <p className="mt-6 animate-floaty text-center text-xs text-white/55">
          点点屏幕任意处，让心愿飞起来 · 流星划过时点一下许愿 ✦
        </p>
      )}

      {/* 流星许愿（吹完蜡烛解锁） */}
      {candlesOut && <WishingStars />}
    </div>
  )
}
