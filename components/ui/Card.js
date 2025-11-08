import clsx from 'clsx'

export default function Card({ className, children, padding = 'p-6', ...rest }) {
  return (
    <div 
      className={clsx(
        'bg-[#4A4A4A]', /* Lighter shade than original #3A3A3A */
        'rounded-xl', /* Use your existing radius */
        'shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-shadow duration-300',
        padding, 
        className
      )} 
      {...rest}
    >
      {children}
    </div>
  )
}
