import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Music, Music2, Loader2, Lock } from 'lucide-react'
import { giftConfig } from './data/gift.config'
import { useAudio } from './hooks/useAudio'
import ParticleBackground from './components/ParticleBackground'
import TypewriterText from './components/TypewriterText'
import GlassCard from './components/GlassCard'
import TrackingProgress from './components/TrackingProgress'
import PhotoWall from './components/PhotoWall'
import GiftPackage from './components/GiftPackage'
import BirthdayWishes from './components/BirthdayWishes'
import HeartBurst from './components/HeartBurst'

const ACTS = ['intro', 'tracking', 'unwrap', 'photos', 'wishes']

export default function App() {
  const [act, setAct] = useState('intro') // intro → tracking → unwrap → wishes
  const [introDone, setIntroDone] = useState(false)
  const [trackingDone, setTrackingDone] = useState(false)
  const stageRef = useRef(null)
  const { playing, toggle, unlock } = useAudio(giftConfig.bgm)

  // 已到达的最远幕：锁定右侧指示器，未解锁的幕不剧透、不可跳
  const [maxAct, setMaxAct] = useState(0)
  useEffect(() => setMaxAct((m) => Math.max(m, ACTS.indexOf(act))), [act])
  const jump = useCallback((a) => {
    if (ACTS.indexOf(a) <= maxAct) setAct(a)
  }, [maxAct])

  // 移动端音乐：首次任意手势解锁（但跳过音乐按钮自身的点击，避免与 toggle 冲突）
  useEffect(() => {
    const onFirst = (e) => {
      if (e.target && e.target.closest && e.target.closest('[data-music-btn]')) return
      unlock()
      window.removeEventListener('pointerdown', onFirst)
    }
    window.addEventListener('pointerdown', onFirst)
    return () => window.removeEventListener('pointerdown', onFirst)
  }, [unlock])

  // 切幕转场动画
  useEffect(() => {
    if (!stageRef.current) return
    gsap.fromTo(
      stageRef.current,
      { opacity: 0, y: 24, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
    )
  }, [act])

  const goTracking = useCallback(() => {
    if (introDone) return
    setIntroDone(true)
    setAct('tracking')
  }, [introDone])

  const goUnwrap = useCallback(() => {
    if (trackingDone) return
    setTrackingDone(true)
    setAct('unwrap')
  }, [trackingDone])

  const goPhotos = useCallback(() => setAct('photos'), [])
  const goWishes = useCallback(() => setAct('wishes'), [])
  const moodIndex = ACTS.indexOf(act)

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden text-white">
      <ParticleBackground mood={act} />

      {/* 顶部音乐开关 */}
      <button
        data-music-btn
        onClick={toggle}
        aria-label={playing ? '关闭音乐' : '开启音乐'}
        className="fixed right-4 z-40 grid h-10 w-10 place-items-center rounded-full glass text-white active:scale-90"
        style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        {playing ? <Music size={18} /> : <Music2 size={18} className="opacity-70" />}
      </button>

      {/* 幕容器 */}
      <section
        ref={stageRef}
        key={act}
        className={`relative z-10 flex min-h-screen w-full flex-col items-center safe-pt safe-pb ${
          act === 'photos' || act === 'tracking' ? 'justify-start pt-20 pb-10 overflow-y-auto' : 'justify-center pt-20 pb-10'
        }`}
      >
        {act === 'intro' && <Intro onDone={goTracking} />}
        {act === 'tracking' && <Tracking onComplete={goUnwrap} />}
        {act === 'unwrap' && <GiftPackage onUnwrap={goPhotos} />}
        {act === 'photos' && <PhotoWall onDone={goWishes} />}
        {act === 'wishes' && <BirthdayWishes />}
      </section>

      {/* 进度指示器 */}
      <ActIndicator act={moodIndex} max={maxAct} onJump={jump} />

      {/* 爱心上飘层（仅祝福页启用） */}
      {act === 'wishes' && <HeartBurst />}
    </main>
  )
}

/* —— 第一幕：开场 —— */
function Intro({ onDone }) {
  const [start, setStart] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setStart(true), 600)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <GlassCard className="w-full p-8" glow="rgba(168,200,255,0.4)">
        <div className="mb-4 flex items-center justify-center gap-2 text-xs tracking-[0.3em] text-white/60">
          <Loader2 size={14} className="animate-spin" />
          <span>SYSTEM · 正在派送</span>
        </div>
        <h1 className="mb-6 text-2xl font-semibold text-gradient">
          寄给 {giftConfig.name} 的 {giftConfig.age} 岁
        </h1>
        <div className="min-h-[5em] text-[15px] leading-loose text-white/85">
          <TypewriterText
            lines={giftConfig.introLines}
            speed={80}
            lineDelay={700}
            start={start}
            onDone={() => setTimeout(onDone, 1100)}
          />
        </div>
      </GlassCard>
      <p className="mt-6 text-xs text-white/40">由 {giftConfig.signature} 寄出</p>
    </div>
  )
}

/* —— 第二幕：物流追踪（带标题） —— */
function Tracking({ onComplete }) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-8 text-center">
        <p className="text-xs tracking-[0.3em] text-white/55">LOGISTICS · 实时追踪</p>
        <h2 className="mt-2 text-2xl font-semibold text-gradient">
          你的包裹，正在路上
        </h2>
      </div>
      <TrackingProgress onComplete={onComplete} />
    </div>
  )
}

/* —— 幕指示器 —— */
function ActIndicator({ act, max, onJump }) {
  const labels = ['启程', '在路上', '到达', '回忆', '祝福']
  const acts = ['intro', 'tracking', 'unwrap', 'photos', 'wishes']
  return (
    <nav className="fixed right-4 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2.5 rounded-2xl glass px-3 py-4 safe-pt">
      {labels.map((l, i) => {
        const locked = i > max
        return (
          <button
            key={i}
            onClick={locked ? undefined : () => onJump && onJump(acts[i])}
            disabled={locked}
            aria-label={locked ? '未解锁' : l}
            className={`whitespace-nowrap text-[11px] leading-relaxed transition-all ${
              locked
                ? 'text-white/20'
                : i === act
                ? 'cursor-pointer font-semibold text-petal'
                : 'cursor-pointer text-white/45 hover:text-white/80'
            }`}
          >
            {locked ? <Lock size={11} /> : l}
          </button>
        )
      })}
    </nav>
  )
}
