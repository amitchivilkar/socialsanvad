import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90",
  secondary:
    "bg-transparent text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--foreground)]",
  ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--secondary)]",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-12 px-8 text-base md:text-lg",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
