import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-10 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 text-sm text-slate-100 shadow-sm placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export { Input };
