import clsx from 'clsx'

export default function Card({ className, children, padding = 'p-6', ...rest }) {
  return (
    <div 
      className={clsx(
        'bg-[#4A4A4A]', /* Lighter shade than original #3A3A3A */
        'rounded-xl', /* Use your existing radius */
        'shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-300',
        'ring-1 ring-white/5', /* Subtle ring for definition */
        padding, 
        className
      )} 
      {...rest}
    >
      {children}
    </div>
  )
}
