import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      default: "bg-primary text-white hover:opacity-90",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      outline: "border hover:bg-gray-100 dark:hover:bg-gray-800",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      link: "underline-offset-4 hover:underline text-primary",
    };
    
    const sizes = {
      default: "h-10 py-2 px-4",
      sm: "h-9 px-3 rounded-md",
      lg: "h-11 px-8 rounded-md",
      icon: "h-10 w-10",
    };
    
    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };

