import { cn } from '@/utilities/ui'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

export interface TextLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export const TextLink: React.FC<TextLinkProps> = ({ href, children, className }) => {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-2 text-[#0b3d2e] hover:text-[#091f18] font-medium transition-colors',
        className,
      )}
    >
      {children}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  )
}

export default TextLink
