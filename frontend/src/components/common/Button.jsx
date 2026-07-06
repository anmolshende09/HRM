import React from "react";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-primary text-white hover:bg-primary-focus shadow-sm hover:shadow-md disabled:bg-ink-muted48/40",

  secondary:
    "bg-transparent text-primary border border-primary hover:bg-primary/5 shadow-sm hover:shadow-md",

  dark:
    "bg-ink text-white rounded-sm hover:bg-black shadow-sm hover:shadow-md",

  ghost:
    "bg-transparent text-ink hover:bg-black/5",

  danger:
    "bg-danger text-white hover:bg-danger/90 shadow-sm hover:shadow-md",
};

const SIZES = {
  sm: "text-caption px-4 py-2.5 min-h-[40px]",

  md: "text-body px-6 py-3 min-h-[46px]",

  lg: "text-button-large px-8 py-3.5 min-h-[52px]",
};

/**
 * Premium reusable Button
 *
 * Features
 * - Dynamic width (fits content)
 * - Apple-inspired pill buttons
 * - Hover lift animation
 * - Focus ring
 * - Loading spinner
 * - Optional icon
 */

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  type = "button",
  ...props
}) {
  const isPill = variant !== "dark";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        press-active
        inline-flex
        items-center
        justify-center
        gap-2.5
        whitespace-nowrap
        font-semibold
        select-none

        ${
          isPill
            ? "rounded-pill"
            : "rounded-sm"
        }

        ${VARIANTS[variant]}
        ${SIZES[size]}

        transition-all
        duration-200
        ease-out

        hover:-translate-y-[1px]
        active:translate-y-0

        focus:outline-none
        focus-visible:ring-4
        focus-visible:ring-primary/20

        disabled:cursor-not-allowed
        disabled:opacity-60
        disabled:shadow-none
        disabled:hover:translate-y-0

        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2
          size={18}
          className="animate-spin shrink-0"
        />
      ) : Icon ? (
        <Icon
          size={18}
          className="shrink-0"
        />
      ) : null}

      <span>{children}</span>
    </button>
  );
}