import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const Switch = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <label className={cn("relative inline-flex cursor-pointer items-center", className)}>
      <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
      <span className="h-5 w-9 rounded-full bg-slate-700 transition peer-checked:bg-sky-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-500 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-950" />
      <span className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
    </label>
  ),
);

Switch.displayName = "Switch";

export { Switch };
