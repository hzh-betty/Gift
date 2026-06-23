import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * 手写签名动画 —— stroke-dashoffset 描出 cursive 笔迹
 * @param {boolean} play 是否开始绘制
 */
export default function Signature({ play = true }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!play || !ref.current) return
    const path = ref.current
    const len = path.getTotalLength()
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
    gsap.to(path, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut' })
  }, [play])
  return (
    <svg viewBox="0 0 92 56" className="mx-auto h-12 w-28" aria-hidden="true">
      <path
        ref={ref}
        d="M 8 48 C 6 36 10 22 18 22 C 26 22 26 36 22 48 Q 29 34 38 36 Q 46 38 40 48 C 38 36 42 22 50 22 C 58 22 58 36 54 48 C 60 48 68 42 76 44"
        fill="none"
        stroke="#ffd6e8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
