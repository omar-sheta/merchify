import clsx from 'clsx'

export default function Card({ className, children, padding = 'p-6', ...rest }) {
  return (
    <div 
      className={clsx(
        'bg-card', /* This is now #3A3A3A */
        'rounded-xl', /* Use your existing radius */
        'border border-card-light', /* This is #4A4A4A */
        padding, 
        className
      )} 
      {...rest}
    >
      {children}
    </div>
  )
}
