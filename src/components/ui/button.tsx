import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-200 ease-out active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02]",
        destructive: "bg-destructive text-destructive-foreground rounded-md shadow-sm hover:bg-destructive/90 hover:shadow-md hover:-translate-y-0.5",
        outline: "border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:-translate-y-0.5",
        secondary: "bg-secondary text-secondary-foreground rounded-md shadow-sm hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5",
        ghost: "rounded-md hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]",
        link: "text-primary underline-offset-4 hover:underline",
        // ANPG Premium variants with sophisticated hover effects
        hero: "bg-primary text-primary-foreground rounded-md shadow-lg hover:bg-anpg-red-dark hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_20px_40px_-10px_hsl(var(--primary)/0.4)]",
        heroOutline: "border-2 border-primary-foreground/80 text-primary-foreground rounded-md backdrop-blur-sm hover:bg-primary-foreground hover:text-foreground hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02]",
        heroOutlineLight: "border-2 border-foreground text-foreground rounded-md hover:bg-foreground hover:text-background hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02]",
        institutional: "bg-foreground text-background rounded-md shadow-sm hover:bg-graphite-light hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02]",
        subtle: "bg-secondary/80 text-secondary-foreground rounded-md hover:bg-secondary hover:shadow-sm hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
