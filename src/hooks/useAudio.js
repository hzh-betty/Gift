import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 背景音乐播放 Hook（兼容移动端 autoplay 限制）
 * - 首次用户手势会自动 unlock
 * - 返回 { ready, playing, toggle, unlock }
 */
export function useAudio(src) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!src) return
    const a = new Audio(src)
    a.loop = true
    a.volume = 0.45
    a.preload = 'auto'
    audioRef.current = a
    const onReady = () => setReady(true)
    a.addEventListener('canplaythrough', onReady, { once: true })
    // 即便不能 canplaythrough，也标记可播放
    const t = setTimeout(() => setReady(true), 1200)
    return () => {
      clearTimeout(t)
      a.removeEventListener('canplaythrough', onReady)
      a.pause()
      audioRef.current = null
    }
  }, [src])

  const unlock = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    a.play()
      .then(() => setPlaying(true))
      .catch(() => {})
  }, [])

  const toggle = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    } else {
      a.pause()
      setPlaying(false)
    }
  }, [])

  return { ready, playing, toggle, unlock }
}

export default useAudio
