import { useEffect, useRef } from 'react'

/**
 * Canvas 星空 + 柔光粒子 混合背景
 * @param {object} props
 * @param {'intro'|'tracking'|'unwrap'|'wishes'} props.mood  不同阶段调整色调与速度
 */
export default function ParticleBackground({ mood = 'intro' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    let w = 0
    let h = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    // —— 不同阶段配色 / 速度 ——
    const moodMap = {
      intro: { speed: 0.18, tintA: '#a8c8ff', tintB: '#5d6bff', starAlpha: 0.85, bokehCount: 14 },
      tracking: { speed: 0.34, tintA: '#c8b6ff', tintB: '#f9b8d4', starAlpha: 0.9, bokehCount: 18 },
      unwrap: { speed: 0.6, tintA: '#ffd6e8', tintB: '#a8c8ff', starAlpha: 1, bokehCount: 26 },
      wishes: { speed: 0.26, tintA: '#ffd27a', tintB: '#ffd6e8', starAlpha: 0.95, bokehCount: 22 },
    }
    const cfg = moodMap[mood] || moodMap.intro

    // —— 数据 ——
    let stars = []
    let bokehs = []
    let fireflies = []
    let shootingStar = null
    let lastShoot = 0

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // 重新生成
      const starCount = Math.floor((w * h) / 6500)
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * cfg.starAlpha + 0.1,
        tw: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      }))
      bokehs = Array.from({ length: cfg.bokehCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 38 + 14,
        vx: (Math.random() - 0.5) * cfg.speed,
        vy: (Math.random() - 0.5) * cfg.speed - 0.05,
        hue: Math.random() < 0.5 ? cfg.tintA : cfg.tintB,
        a: Math.random() * 0.3 + 0.12,
      }))
      // 萤火虫（仅 wishes 幕）：暖黄绿，缓慢漂移 + 明灭
      fireflies = mood === 'wishes'
        ? Array.from({ length: 26 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.6 + 0.8,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            phase: Math.random() * Math.PI * 2,
            tw: Math.random() * 0.04 + 0.01,
          }))
        : []
    }

    const drawBg = () => {
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, '#0b1437')
      grad.addColorStop(0.45, '#16224f')
      grad.addColorStop(1, '#2a1d4a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
      // 顶部柔光
      const top = ctx.createRadialGradient(w * 0.7, h * 0.1, 0, w * 0.7, h * 0.1, h * 0.8)
      top.addColorStop(0, 'rgba(168,200,255,0.22)')
      top.addColorStop(1, 'rgba(168,200,255,0)')
      ctx.fillStyle = top
      ctx.fillRect(0, 0, w, h)
    }

    const drawStars = (t) => {
      for (const s of stars) {
        const alpha = s.a + Math.sin(t * s.tw + s.phase) * 0.3
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, alpha))})`
        ctx.fill()
      }
    }

    const drawBokeh = () => {
      for (const b of bokehs) {
        b.x += b.vx
        b.y += b.vy
        if (b.x < -b.r) b.x = w + b.r
        if (b.x > w + b.r) b.x = -b.r
        if (b.y < -b.r) b.y = h + b.r
        if (b.y > h + b.r) b.y = -b.r
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        g.addColorStop(0, b.hue + Math.floor(b.a * 255).toString(16).padStart(2, '0'))
        g.addColorStop(1, b.hue + '00')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const maybeShoot = (t) => {
      if (!shootingStar && t - lastShoot > 6000 + Math.random() * 4000) {
        lastShoot = t
        shootingStar = {
          x: Math.random() * w * 0.6,
          y: Math.random() * h * 0.4,
          vx: 6 + Math.random() * 4,
          vy: 2 + Math.random() * 2,
          life: 0,
          max: 60,
        }
      }
      if (shootingStar) {
        const s = shootingStar
        s.x += s.vx
        s.y += s.vy
        s.life++
        const tailLen = 80
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 8, s.y - s.vy * 8)
        grad.addColorStop(0, 'rgba(255,255,255,0.9)')
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8)
        ctx.stroke()
        if (s.life > s.max || s.x > w || s.y > h) shootingStar = null
      }
    }

    const drawFireflies = (t) => {
      for (const f of fireflies) {
        f.x += f.vx
        f.y += f.vy
        if (f.x < -10) f.x = w + 10
        if (f.x > w + 10) f.x = -10
        if (f.y < -10) f.y = h + 10
        if (f.y > h + 10) f.y = -10
        const glow = (Math.sin(t * f.tw + f.phase) + 1) / 2
        // 径向渐变模拟光晕，替代昂贵的 shadowBlur（逐点 shadow 是 Canvas 最贵操作）
        const core = f.r * (0.6 + glow * 0.8)
        const halo = core * 4
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, halo)
        g.addColorStop(0, `rgba(255,234,150,${0.35 + glow * 0.55})`)
        g.addColorStop(0.35, `rgba(255,210,120,${0.15 + glow * 0.3})`)
        g.addColorStop(1, 'rgba(255,210,120,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(f.x, f.y, halo, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = (t) => {
      drawBg()
      if (fireflies.length) drawFireflies(t)
      else drawBokeh()
      drawStars(t)
      maybeShoot(t)
      raf = requestAnimationFrame(loop)
    }

    resize()
    raf = requestAnimationFrame(loop)
    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [mood])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      style={{ width: '100vw', height: '100dvh' }}
      aria-hidden="true"
    />
  )
}
