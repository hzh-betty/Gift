import { useEffect, useRef, useState } from 'react'

/**
 * 打字机文字
 * @param {string[]} lines           多行文本
 * @param {number}   speed           每字毫秒
 * @param {number}   lineDelay       行间停顿毫秒
 * @param {function} onDone          全部完成回调
 * @param {boolean}  start           是否开始（false 则等待）
 * @param {string}   className
 * @param {boolean}  cursor          是否显示光标
 */
export default function TypewriterText({
  lines = [],
  speed = 70,
  lineDelay = 480,
  onDone,
  start = true,
  className = '',
  cursor = true,
}) {
  const [display, setDisplay] = useState([])
  const doneRef = useRef(false)

  useEffect(() => {
    if (!start) return
    setDisplay([])
    doneRef.current = false
    let line = 0
    let char = 0
    let timer = 0

    const tick = () => {
      if (line >= lines.length) {
        if (!doneRef.current) {
          doneRef.current = true
          onDone && onDone()
        }
        return
      }
      const cur = lines[line]
      if (char <= cur.length) {
        setDisplay((d) => {
          const next = [...d]
          next[line] = cur.slice(0, char)
          return next
        })
        char++
        timer = setTimeout(tick, speed)
      } else {
        line++
        char = 0
        timer = setTimeout(tick, lineDelay)
      }
    }
    timer = setTimeout(tick, speed)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, lines.join('|'), speed, lineDelay])

  return (
    <div className={className} aria-live="polite">
      {lines.map((_, i) => (
        <p
          key={i}
          className={`whitespace-pre-wrap ${cursor && i === display.length - 1 ? 'tw-cursor' : ''}`}
        >
          {display[i] || ''}
        </p>
      ))}
    </div>
  )
}
