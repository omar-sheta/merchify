import clsx from 'clsx'

export default function Card({ className, children, padding = 'p-8', ...rest }) {
  return (
    <div className={clsx('bg-white glass-card rounded-2xl border border-white/60 shadow-[var(--brand-shadow-md)]', padding, className)} {...rest}>
      {children}
    </div>
  )
}
