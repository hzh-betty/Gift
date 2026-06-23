import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Gift, Sparkles } from 'lucide-react'
import { giftConfig } from '../data/gift.config'

/**
 * 可点击包裹 —— 浮入呼吸 + 点击爆破 + 烟花粒子
 * @param {function} onUnwrap  爆破完成后回调（切到祝福页）
 */
export default function GiftPackage({ onUnwrap }) {
  const wrapRef = useRef(null)
  const boxRef = useRef(null)
  const confettiRef = useRef(null)
  const [hintVisible, setHintVisible] = useState(true)
  const unwrappingRef = useRef(false)

  // 浮入 + 呼吸
  useEffect(() => {
    const box = boxRef.current
    const wrap = wrapRef.current
    if (!box || !wrap) return
    const ctx = gsap.context(() => {
      gsap.set(wrap, { opacity: 0, y: 40, scale: 0.8 })
      gsap.to(wrap, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
      })
      // 呼吸
      gsap.to(box, {
        y: -12,
        duration: 1.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      // 光晕脉冲
      gsap.to(box, {
        filter: 'drop-shadow(0 0 24px rgba(255,214,232,0.85))',
        duration: 1.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    })
    return () => ctx.revert()
  }, [])

  const spawnConfetti = () => {
    const layer = confettiRef.current
    if (!layer) return
    const colors = ['#ffd6e8', '#a8c8ff', '#ffd27a', '#c8b6ff', '#ffffff']
    const pieces = 48
    for (let i = 0; i < pieces; i++) {
      const el = document.createElement('span')
      const size = Math.random() * 8 + 4
      const color = colors[(Math.random() * colors.length) | 0]
      el.style.cssText = `position:absolute;left:50%;top:50%;width:${size}px;height:${size}px;border-radius:${Math.random() > 0.5 ? '50%' : '2px'};background:${color};pointer-events:none;`
      layer.appendChild(el)
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * 220 + 80
      gsap.to(el, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist + Math.random() * 60,
        rotation: Math.random() * 720 - 360,
        opacity: 0,
        scale: Math.random() * 0.6 + 0.4,
        duration: 1.6 + Math.random() * 0.8,
        ease: 'power2.out',
        onComplete: () => el.remove(),
      })
    }
  }

  const handleUnwrap = () => {
    if (unwrappingRef.current) return
    unwrappingRef.current = true
    setHintVisible(false)
    const box = boxRef.current
    const wrap = wrapRef.current

    // 停掉呼吸 / 光晕脉冲，避免与爆破 filter 冲突
    gsap.killTweensOf(box)
    gsap.killTweensOf(wrap, 'opacity')

    spawnConfetti()

    gsap.timeline({ onComplete: () => onUnwrap && onUnwrap() })
      .to(box, {
        scale: 1.3,
        rotation: -8,
        duration: 0.28,
        ease: 'back.out(2)',
      })
      .to(box, {
        scale: 0,
        rotation: 40,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.55,
        ease: 'power2.in',
        overwrite: true,
      })
      .to(wrap, { opacity: 0, duration: 0.3 }, '<0.15')
  }

  return (
    <div
      ref={wrapRef}
      className="flex min-h-[70vh] w-full flex-col items-center justify-center px-6 text-center"
    >
      <div className="mb-8 text-base text-white/70">
        <span className="shimmer-text font-medium">
          {giftConfig.stages[2].title}
        </span>
      </div>

      <button
        ref={boxRef}
        onClick={handleUnwrap}
        aria-label="拆开包裹"
        className="relative grid h-40 w-40 cursor-pointer place-items-center rounded-[28px] bg-gradient-to-br from-blossom via-petal to-skyblue shadow-glow transition-transform active:scale-95"
        style={{ filter: 'drop-shadow(0 0 18px rgba(255,214,232,0.6))' }}
      >
        <div className="absolute inset-0 rounded-[28px] border border-white/50" />
        {/* 蝴蝶结 */}
        <div className="absolute -top-4 left-1/2 h-6 w-10 -translate-x-1/2 rounded-full bg-petal/80 blur-[1px]" />
        <Gift size={64} className="relative text-white drop-shadow" strokeWidth={1.6} />
        <Sparkles
          size={22}
          className="absolute -right-2 -top-2 animate-pulseDot text-warmgold"
        />
      </button>

      <p
        className={`mt-8 text-sm tracking-wide text-white/75 transition-opacity duration-500 ${
          hintVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {giftConfig.unwrapHint}
        <span className="tw-cursor" />
      </p>

      {/* 烟花层 */}
      <div
        ref={confettiRef}
        className="pointer-events-none fixed inset-0 z-30"
        aria-hidden="true"
      />
    </div>
  )
}
