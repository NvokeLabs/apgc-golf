import { cn } from '@/utilities/ui'
import { TextLink } from './TextLink'

interface SectionHeaderProps {
  label?: string
  title: string
  titleHighlight?: string
  description?: string
  link?: {
    href: string
    text: string
  }
  className?: string
  align?: 'left' | 'center'
}

export function SectionHeader({
  label,
  title,
  titleHighlight,
  description,
  link,
  className,
  align = 'left',
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 mb-12',
        align === 'center'
          ? 'items-center text-center'
          : 'md:flex-row md:justify-between md:items-end',
        className,
      )}
    >
      <div>
        {label && (
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#0b3d2e] animate-pulse" />
            <span className="text-[#0b3d2e] text-xs font-bold tracking-[0.2em] uppercase">
              {label}
            </span>
          </div>
        )}
        <h2 className="text-3xl md:text-4xl font-bold text-[#0b3d2e]">
          {title}
          {titleHighlight && (
            <>
              {' '}
              <span className="font-serif italic font-medium">{titleHighlight}</span>
            </>
          )}
        </h2>
        {description && <p className="text-[#636364] text-lg mt-2 max-w-xl">{description}</p>}
      </div>

      {link && (
        <TextLink href={link.href} className="shrink-0">
          {link.text}
        </TextLink>
      )}
    </div>
  )
}
