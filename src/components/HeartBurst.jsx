import { useCallback, useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * 点击屏幕飘出爱心/星粒
 * - 监听 window pointerdown，不阻挡其它按钮交互
 * - 暴露 window.__heartBurst(x,y,count) 供吹蜡烛等场景主动触发
 */
export default function HeartBurst() {
  const layerRef = useRef(null)

  const spawnAt = useCallback((x, y, count = 6) => {
    const layer = layerRef.current
    if (!layer) return
    const glyphs = ['❤', '✦', '✧', '♥', '⋆']
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span')
      const isHeart = Math.random() > 0.5
      el.textContent = isHeart ? '❤' : glyphs[(Math.random() * glyphs.length) | 0]
      const size = Math.random() * 16 + 12
      const color = isHeart
        ? `hsl(${330 + Math.random() * 20}, 90%, ${75 + Math.random() * 10}%)`
        : `hsl(${45 + Math.random() * 30}, 95%, ${78 + Math.random() * 10}%)`
      el.style.cssText = `position:fixed;left:${x}px;top:${y}px;font-size:${size}px;color:${color};text-shadow:0 0 10px ${color}99;will-change:transform,opacity;`
      layer.appendChild(el)
      const dx = (Math.random() - 0.5) * 120
      const dy = -Math.random() * 180 - 60
      gsap.to(el, {
        x: dx,
        y: dy,
        rotation: Math.random() * 120 - 60,
        opacity: 0,
        scale: 0.4,
        duration: 1.6 + Math.random() * 0.6,
        ease: 'power1.out',
        onComplete: () => el.remove(),
      })
    }
  }, [])

  useEffect(() => {
    window.__heartBurst = spawnAt
    const onDown = (e) => {
      const x = e.clientX
      const y = e.clientY
      if (x == null) return
      spawnAt(x, y, 5)
    }
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      delete window.__heartBurst
    }
  }, [spawnAt])

  return (
    <div
      ref={layerRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  )
}
