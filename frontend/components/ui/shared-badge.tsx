import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

const badgeColors: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  default: "bg-gray-100 text-gray-800",
};

export function SharedBadge({
  children,
  variant = "default",
  className = "",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        badgeColors[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
