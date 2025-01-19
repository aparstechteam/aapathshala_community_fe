import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type DashProps = {
    title: string
    stat: number | undefined | string
    icon: ReactNode
    className?: string
    onClick?: () => void
}

export const DashCard = ({ title, stat, icon, className, onClick }: DashProps) => (
    <div className={cn(
        'p-4 rounded-lg grid gap-2 relative duration-300 hover:scale-95',
        'bg-white dark:bg-green-800/10',
        'ring-0 dark:ring-0 ring-slate-200 dark:ring-green-700',
        'shadow-sm dark:shadow-md dark:shadow-green-600/20',
        'transition-all duration-200',
        className
    )}>

        <h2 className='flex justify-between font-extrabold text-4xl text-slate-900 dark:text-teal-50'>

            <span>
                {icon}
            </span>
            <span>
                {/* <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M10.4921 8.91012C10.4497 8.67687 10.2456 8.49999 10.0001 8.49999C9.72397 8.49999 9.50011 8.72385 9.50011 8.99999V13.5021L9.50817 13.592C9.55051 13.8253 9.75465 14.0021 10.0001 14.0021C10.2763 14.0021 10.5001 13.7783 10.5001 13.5021V8.99999L10.4921 8.91012ZM10.7988 6.74999C10.7988 6.33578 10.463 5.99999 10.0488 5.99999C9.63461 5.99999 9.29883 6.33578 9.29883 6.74999C9.29883 7.16421 9.63461 7.49999 10.0488 7.49999C10.463 7.49999 10.7988 7.16421 10.7988 6.74999ZM18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10ZM3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10Z"
                        fill="#475467" />
                </svg> */}
            </span>
        </h2>
        <div className="mt-1">
            <h2 className='font-medium text-basemd:text-lg text-slate-800 dark:text-green-400'>
                {title}
            </h2>
            <h2 className='font-bold text-lg md:text-2xl text-slate-800 dark:text-green-400'>
                {stat}
            </h2>
        </div>
        {onClick && <button type="button" onClick={onClick} className="absolute top-0 right-0 w-full h-full" />}
    </div>
)