export default function SectionHeading({ eyebrow, title, subtitle, align='center', className='' }) {
  return (
    <div className={`mb-10 ${align === 'center' ? 'text-center mx-auto max-w-3xl' : ''} ${className}`}>
      {eyebrow && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-accent-yellow mb-4 anim-fade-in">
          {eyebrow}
        </div>
      )}
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-text-primary anim-fade-in" style={{lineHeight:'1.15'}}>{title}</h2>
      )}
      {subtitle && (
        <p className="text-lg text-text-secondary leading-relaxed anim-fade-in" style={{animationDelay:'.1s'}}>{subtitle}</p>
      )}
    </div>
  )}
