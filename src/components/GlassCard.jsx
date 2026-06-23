/**
 * 毛玻璃卡片
 * @param {string}  variant  'soft' | 'strong'
 * @param {string}  glow     边光色 (rgba)
 */
export default function GlassCard({
  children,
  className = '',
  variant = 'soft',
  glow,
  style,
  ...rest
}) {
  const base = variant === 'strong' ? 'glass-strong' : 'glass'
  return (
    <div
      className={`rounded-3xl ${base} ${className}`}
      style={{
        boxShadow: glow
          ? `0 8px 40px rgba(180,140,220,0.35), 0 0 0 1px ${glow} inset`
          : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
