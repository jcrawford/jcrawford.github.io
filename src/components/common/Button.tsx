import React from "react";
import { Link } from "gatsby";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "cta" | "outline" | "text";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  external?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled = false,
  type = "button",
  className = "",
  external = false,
}) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold transition-colors rounded-lg";

  const variantClasses = {
    primary: "bg-primary text-white hover:bg-opacity-90",
    secondary: "bg-tertiary text-white hover:bg-opacity-90",
    cta: "bg-primary text-white hover:bg-opacity-90 shadow-lg",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
    text: "text-primary hover:text-link-hover",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  const allClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          className={allClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }

    return (
      <Link to={href} className={allClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={allClasses}
    >
      {children}
    </button>
  );
};

