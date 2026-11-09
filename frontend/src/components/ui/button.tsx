import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-[12.5px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border border-ink bg-ink text-white hover:bg-[#2a2a2f]',
        outline: 'border border-line bg-surface text-ink hover:bg-shell',
        brand: 'border border-brand bg-brand text-white hover:bg-[#e85f24]',
        ghost: 'border border-transparent text-ink hover:bg-shell',
      },
      size: {
        default: 'h-[37px] rounded-[9px] px-[14px] py-[6px]',
        sm: 'h-[32px] rounded-[7px] px-[10px]',
        lg: 'h-[42px] rounded-[10px] px-[16px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
