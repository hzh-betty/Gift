import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Package, Truck, MapPin, Check } from 'lucide-react'
import { giftConfig } from '../data/gift.config'
import GlassCard from './GlassCard'
import TypewriterText from './TypewriterText'
import RouteMap from './RouteMap'

/**
 * 物流三段式进度 —— 已发货 / 运输中 / 已签收
 * @param {function} onComplete  三段全部解锁后回调
 */
export default function TrackingProgress({ onComplete }) {
  const stages = giftConfig.stages
  const [active, setActive] = useState(0) // 当前正在播放的段（0 = 已发货，从成都出发）
  const [done, setDone] = useState([])
  const rootRef = useRef(null)
  const lineRefs = useRef([])
  const nodeRefs = useRef([])
  const cardRefs = useRef([])
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  useEffect(() => {
    const tl = gsap.timeline()
    let cancelled = false

    stages.forEach((s, i) => {
      const line = lineRefs.current[i]
      const node = nodeRefs.current[i]
      const card = cardRefs.current[i]

      // 进度线：scaleY 0 -> 1（垂直自上而下填充）
      if (line) {
        gsap.set(line, { scaleY: 0, transformOrigin: 'top center' })
      }
      // 节点初始
      if (node) gsap.set(node, { scale: 0, opacity: 0 })
      // 卡片初始
      if (card) gsap.set(card, { y: 30, opacity: 0 })

      tl.call(() => !cancelled && setActive(i))
        // 节点弹入
        .to(node, {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: 'elastic.out(1,0.55)',
        }, '>')

      // 进度线（仅非末段才有线元素）
      if (line) {
        tl.to(line, { scaleY: 1, duration: 0.9, ease: 'power2.out' }, '<0.15')
      }

      tl // 卡片浮起
        .to(card, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
        }, '<0.1')
        // 文字打字机由 active 状态触发（TypewriterText start 控制中）
        .to({}, { duration: 2.4 })
        .call(() => {
          if (cancelled) return
          setDone((d) => [...d, i])
        })
    })

    // 全部完成后回调
    tl.call(() => {
      if (cancelled) return
      setActive(stages.length)
      completeRef.current && completeRef.current()
    })

    return () => {
      cancelled = true
      tl.kill()
    }
  }, [stages])

  const icons = [Package, Truck, MapPin]

  return (
    <div
      ref={rootRef}
      className="mx-auto w-full max-w-md px-5"
      role="region"
      aria-label="物流追踪"
    >
      <div className="mb-6">
        <RouteMap active={active} />
      </div>
      <div className="relative pl-2">
        {stages.map((s, i) => {
          const Icon = icons[i]
          const isActive = active === i
          const isDone = done.includes(i)
          const isLast = i === stages.length - 1
          return (
            <div key={s.key} className="relative pb-6 last:pb-2">
              <div className="flex gap-4">
                {/* 节点 + 进度线 */}
                <div className="relative flex flex-col items-center">
                  <div
                    ref={(el) => (nodeRefs.current[i] = el)}
                    className={`relative z-10 grid h-12 w-12 place-items-center rounded-full border transition-colors ${
                      isDone
                        ? 'border-petal bg-gradient-to-br from-blossom to-skyblue text-white'
                        : isActive
                        ? 'border-white/70 bg-white/30 text-white animate-pulseDot'
                        : 'border-white/30 bg-white/10 text-white/70'
                    }`}
                    style={{
                      boxShadow: isDone
                        ? `0 0 18px ${s.accent}aa`
                        : isActive
                        ? `0 0 22px ${s.accent}cc`
                        : 'none',
                    }}
                  >
                    {isDone ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                  {/* 连接下一节点的进度线 */}
                  {!isLast && (
                    <div className="absolute top-12 h-[calc(100%-1.5rem)] w-[2px] overflow-hidden bg-white/15">
                      <div
                        ref={(el) => (lineRefs.current[i] = el)}
                        className="h-full w-full"
                        style={{
                          background: `linear-gradient(${s.accent}, ${stages[i + 1].accent})`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 城市卡 */}
                <div
                  ref={(el) => (cardRefs.current[i] = el)}
                  className="flex-1"
                >
                  <GlassCard
                    className="p-4"
                    glow={isActive || isDone ? `${s.accent}55` : undefined}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide"
                        style={{
                          background: `${s.accent}33`,
                          color: '#fff',
                          border: `1px solid ${s.accent}66`,
                        }}
                      >
                        {s.status}
                      </span>
                      <span className="text-[11px] text-white/60">{s.time}</span>
                    </div>
                    <div className="mt-2 text-lg font-semibold text-gradient">
                      {s.city}
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-white/85">
                      {s.title}
                    </div>
                    {/* 打字机描述：仅当 active 时启动 */}
                    <div className="mt-1 min-h-[3.5em] text-[13px] leading-relaxed text-white/75">
                      <TypewriterText
                        lines={[s.desc]}
                        speed={45}
                        lineDelay={0}
                        start={isActive && !isDone}
                        cursor={false}
                      />
                    </div>
                  </GlassCard>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
