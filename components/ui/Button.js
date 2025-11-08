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
    primary: 'bg-accent-orange text-white font-bold hover:bg-accent-orange-light', // Orange
    secondary: 'bg-bg-card-light text-text-primary hover:bg-opacity-80', // Lighter Gray
    subtle: 'bg-transparent text-text-secondary hover:bg-bg-card-light'
  }
  return (
    <Tag className={clsx(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </Tag>
  )
}
