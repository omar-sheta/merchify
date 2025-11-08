import clsx from 'clsx'

export default function Card({ className, children, padding = 'p-8', glow = false, ...rest }) {
  return (
    <div
      className={clsx(
        'glass-card rounded-2xl transition-colors',
        glow ? 'ring-2 ring-[var(--brand-primary)] shadow-lg' : '',
        padding,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
