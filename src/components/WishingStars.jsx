import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { giftConfig } from '../data/gift.config'

/**
 * 流星许愿 —— 吹完蜡烛后定时划过可点击流星，点中即许一愿
 */
export default function WishingStars() {
  const layerRef = useRef(null)
  const [toast, setToast] = useState(null)
  const idxRef = useRef(0)
  const wishes = giftConfig.wishes
  const toastTimer = useRef(0)

  const spawn = useCallback(() => {
    const layer = layerRef.current
    if (!layer) return
    const star = document.createElement('button')
    const y = Math.random() * window.innerHeight * 0.42 + 40
    star.style.cssText =
      `position:fixed;top:${y}px;left:-40px;z-index:45;border:none;background:transparent;pointer-events:auto;cursor:pointer;`
    star.innerHTML =
      '<span style="font-size:22px;line-height:1;text-shadow:0 0 12px #ffd27a,0 0 24px #ffd27a;">✦</span>'
    layer.appendChild(star)
    const drift = gsap.to(star, {
      x: window.innerWidth + 80,
      duration: 8 + Math.random() * 4,
      ease: 'none',
      onComplete: () => star.remove(),
    })
    star.addEventListener('pointerdown', (e) => {
      e.stopPropagation()
      drift.kill()
      gsap.to(star, { scale: 2.4, opacity: 0, duration: 0.4, onComplete: () => star.remove() })
      setToast(wishes[idxRef.current % wishes.length])
      idxRef.current++
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 3200)
    })
  }, [wishes])

  useEffect(() => {
    const id = setInterval(spawn, 3500)
    spawn()
    return () => { clearInterval(id); clearTimeout(toastTimer.current) }
  }, [spawn])

  return (
    <>
      <div ref={layerRef} className="pointer-events-none fixed inset-0 z-40" aria-hidden="true" />
      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-1/3 z-50 -translate-x-1/2">
          <div className="glass rounded-2xl px-6 py-4 text-center text-sm text-white/95 shadow-glow animate-floaty">
            ✦ {toast}
          </div>
        </div>
      )}
    </>
  )
}
