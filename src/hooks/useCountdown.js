import { useEffect, useState } from 'react'
import { giftConfig } from '../data/gift.config'

/**
 * 计算与目标日期的关系：
 *  - 距离下一个生日还有 N 天（未到）
 *  - 已度过 N 天（已过，含今天为 1）
 *  - 今天就是生日 → 0
 * @param {string} dateStr  YYYY-MM-DD
 */
export function useCountdown(dateStr) {
  const [info, setInfo] = useState({
    days: 0,
    isToday: false,
    isPast: false,
    label: '',
  })

  useEffect(() => {
    if (!dateStr) return
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    // 把配置日期套到「今年」
    const [_, m, d] = dateStr.split('-').map(Number)
    let target = new Date(now.getFullYear(), m - 1, d)
    let isPast = false
    if (target < today) {
      isPast = true
      // 已过：算今年生日到现在
      const diff = Math.floor((today - target) / 86400000)
      setInfo({
        days: diff,
        isToday: diff === 0,
        isPast: true,
        label: `这是你的第 ${giftConfig.age} 个夏天 · 已陪你走过 ${diff + 1} 天`,
      })
      return
    }
    if (target.getTime() === today.getTime()) {
      setInfo({ days: 0, isToday: true, isPast: false, label: '就是今天 ✨' })
      return
    }
    const diff = Math.ceil((target - today) / 86400000)
    setInfo({
      days: diff,
      isToday: false,
      isPast: false,
      label: `距你的 19 岁生日还有 ${diff} 天`,
    })
  }, [dateStr])

  return info
}

export default useCountdown
