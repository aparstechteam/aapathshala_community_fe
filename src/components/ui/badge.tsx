import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex capitalize items-center rounded-full border ring-1 ring-ash dark:ring-0 px-2.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-white dark:bg-gray-800 text-black dark:text-white shadow hover:bg-opacity-80",
                secondary:
                    "border-transparent bg-green-600 text-white hover:bg-green-700",
                destructive:
                    "border-transparent bg-[red] text-destructive-foreground shadow hover:bg-destructive/80",
                outline: "text-black dark:text-white ring-1 ring-ash dark:ring-0",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return !props?.hidden ? (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    ) : null
}

export { Badge, badgeVariants }
