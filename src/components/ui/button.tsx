import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "touch-control inline-flex items-center justify-center gap-2 rounded-md border text-[13px] font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-45",
  {
    variants: {
      variant: {
        default:
          "border-accent-fill bg-accent-fill text-on-accent hover:border-accent-fill-hover hover:bg-accent-fill-hover",
        outline:
          "border-border-strong bg-surface text-ink hover:border-ink-muted",
        ghost:
          "border-transparent bg-transparent text-ink-muted hover:bg-surface-hover hover:text-ink",
      },
      size: {
        sm: "h-[30px] px-2.5 text-xs",
        md: "h-9 px-3.5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
