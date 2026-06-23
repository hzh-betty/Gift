import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Package, Truck, MapPin, Check } from 'lucide-react'
import { giftConfig } from '../data/gift.config'
import GlassCard from './GlassCard'
import TypewriterText from './TypewriterText'
import RouteMap from './RouteMap'

/**
 * 物流进度 —— 已发货 / 运输中×N / 已签收
 * 地图常驻顶部不动；文字区每次只显示当前段卡片，
 * 播完一段淡出换下一段；全部播完后展示所有卡片。
 * @param {function} onComplete  全部播放完回调
 */
export default function TrackingProgress({ onComplete }) {
  const stages = giftConfig.stages
  const [active, setActive] = useState(0)
  const [done, setDone] = useState([])
  const rootRef = useRef(null)
  const lineRefs = useRef([])
  const nodeRefs = useRef([])
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  useEffect(() => {
    const tl = gsap.timeline()
    let cancelled = false

    stages.forEach((s, i) => {
      const line = lineRefs.current[i]
      const node = nodeRefs.current[i]
      if (line) gsap.set(line, { scaleY: 0, transformOrigin: 'top center' })
      if (node) gsap.set(node, { scale: 0, opacity: 0 })

      tl.call(() => !cancelled && setActive(i))
        .to(node, { scale: 1, opacity: 1, duration: 0.7, ease: 'elastic.out(1,0.55)' }, '>')
      if (line) {
        tl.to(line, { scaleY: 1, duration: 0.9, ease: 'power2.out' }, '<0.15')
      }
      tl.to({}, { duration: 3.0 })
        .call(() => { if (!cancelled) setDone((d) => [...d, i]) })
    })

    tl.call(() => {
      if (cancelled) return
      setActive(stages.length)
      completeRef.current && completeRef.current()
    })

    return () => { cancelled = true; tl.kill() }
  }, [stages])

  const icons = stages.map((_, i) =>
    i === 0 ? Package : i === stages.length - 1 ? MapPin : Truck
  )
  const finished = active >= stages.length

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-md px-5" role="region" aria-label="物流追踪">
      {/* 地图常驻顶部，不随文字滚动 */}
      <div className="mb-6">
        <RouteMap active={active} />
      </div>

      {/* 节点轴：常驻显示，标记进度 */}
      <div className="relative mb-6 pl-2">
        <div className="flex items-center justify-between">
          {stages.map((s, i) => {
            const Icon = icons[i]
            const isDone = done.includes(i)
            const isActive = active === i
            return (
              <div key={s.key} className="relative flex flex-1 flex-col items-center">
                <div
                  ref={(el) => (nodeRefs.current[i] = el)}
                  className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border transition-colors ${
                    isDone
                      ? 'border-petal bg-gradient-to-br from-blossom to-skyblue text-white'
                      : isActive
                      ? 'border-white/70 bg-white/30 text-white'
                      : 'border-white/30 bg-white/10 text-white/70'
                  }`}
                  style={{ boxShadow: isDone ? `0 0 14px ${s.accent}aa` : isActive ? `0 0 18px ${s.accent}cc` : 'none' }}
                >
                  {isDone ? <Check size={16} /> : <Icon size={16} />}
                </div>
                {!isLastNode(i, stages) && (
                  <div className="absolute left-1/2 top-1/2 h-[2px] w-full overflow-hidden bg-white/15">
                    <div
                      ref={(el) => (lineRefs.current[i] = el)}
                      className="h-full w-full"
                      style={{ background: `linear-gradient(90deg, ${s.accent}, ${stages[i + 1].accent})` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 文字区：播完前只显示当前段；播完显示全部 */}
      <div className="relative min-h-[10em]">
        {!finished && active < stages.length && (
          <StageCard key={active} s={stages[active]} glow typed />
        )}
        {finished && (
          <div className="flex flex-col gap-3">
            {stages.map((s, i) => (
              <StageCard key={i} s={s} glow />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function isLastNode(i, stages) {
  return i === stages.length - 1
}

/* 单段城市卡片 */
function StageCard({ s, glow, typed }) {
  return (
    <GlassCard className="p-4 animate-[fadeIn_0.5s_ease-out]" glow={glow ? `${s.accent}55` : undefined}>
      <div className="flex items-center justify-between gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide"
          style={{ background: `${s.accent}33`, color: '#fff', border: `1px solid ${s.accent}66` }}
        >
          {s.status}
        </span>
        <span className="text-[11px] text-white/60">{s.time}</span>
      </div>
      <div className="mt-2 text-lg font-semibold text-gradient">{s.city}</div>
      <div className="mt-0.5 text-sm font-medium text-white/85">{s.title}</div>
      <div className="mt-1 min-h-[3.5em] text-[13px] leading-relaxed text-white/75">
        {typed ? (
          <TypewriterText lines={[s.desc]} speed={45} lineDelay={0} start cursor={false} />
        ) : (
          <p>{s.desc}</p>
        )}
      </div>
    </GlassCard>
  )
}
