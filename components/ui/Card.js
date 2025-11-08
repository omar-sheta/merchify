import clsx from 'clsx'

export default function Card({ className, children, padding = 'p-6', ...rest }) {
  return (
    <div 
      className={clsx(
        'bg-white', /* Changed to white for better contrast */
        'rounded-xl', /* Use your existing radius */
        'shadow-lg hover:shadow-xl transition-shadow duration-300',
        padding, 
        className
      )} 
      {...rest}
    >
      {children}
    </div>
  )
}
