import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const headingVariants = cva('font-bold tracking-tight', {
  variants: {
    size: {
      h1: 'text-4xl',
      h2: 'text-3xl',
      h3: 'text-2xl',
    },
  },
  defaultVariants: {
    size: 'h1',
  },
})

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & { as?: 'h1' | 'h2' | 'h3' }

const Heading = ({
  size,
  className,
  children,
  as: Comp = 'h1',
  ...props
}: HeadingProps) => {
  return (
    <Comp className={cn(headingVariants({ size, className }))} {...props}>
      {children}
    </Comp>
  )
}

export { Heading }
