import clsx from 'clsx'

/**
 * Button component
 * Variants: primary, secondary, subtle, danger
 * Sizes: md, lg
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  as: Tag = 'button',
  ...rest
}) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus-visible:ring-0 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none'
  const sizes = {
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-3'
  }
  const variants = {
    primary: 'bg-[var(--brand-primary)] text-[#1C1C1C] font-bold shadow-lg hover:bg-[var(--brand-primary-alt)]',
    secondary: 'bg-[var(--brand-surface-alt)] text-gray-200 shadow-sm hover:bg-[#555] border border-white/10',
    subtle: 'bg-[var(--brand-surface)] text-gray-300 hover:bg-[var(--brand-surface-alt)] border border-white/10',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }
  return (
    <Tag className={clsx(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </Tag>
  )
}
