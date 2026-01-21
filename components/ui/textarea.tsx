import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCharCount?: boolean;
  maxCharCount?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, showCharCount, maxCharCount, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    React.useEffect(() => {
      if (props.value) {
        setCharCount(String(props.value).length);
      } else if (props.defaultValue) {
        setCharCount(String(props.defaultValue).length);
      }
    }, [props.value, props.defaultValue]);

    const isNearLimit = maxCharCount && charCount > maxCharCount * 0.9;
    const isOverLimit = maxCharCount && charCount > maxCharCount;

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        <div className="flex items-center justify-between">
          {error && (
            <p className="text-xs text-destructive animate-slide-down">
              {error}
            </p>
          )}
          {showCharCount && (
            <p className={cn(
              "text-xs transition-colors duration-200 ml-auto",
              isOverLimit ? "text-destructive font-medium" :
                isNearLimit ? "text-amber-600 font-medium" :
                  "text-muted-foreground"
            )}>
              {charCount}{maxCharCount ? ` / ${maxCharCount}` : ''}
            </p>
          )}
        </div>
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
