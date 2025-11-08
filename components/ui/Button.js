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
    primary: 'brand-gradient-bg text-white shadow-md hover:shadow-lg hover:brightness-110',
    secondary: 'bg-white text-gray-800 shadow-sm hover:shadow-md border border-gray-200',
    subtle: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }
  return (
    <Tag className={clsx(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </Tag>
  )
}
