import React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border-none focus:border-none px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none outline-none focus-visible:ring-2 ring-2 ring-gray-200 dark:ring-gray-700 duration-300 focus:ring-hot/30 dark:focus-visible:ring-hot disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
