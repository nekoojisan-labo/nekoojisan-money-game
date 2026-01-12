import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm";
  
  const variants = {
    primary: "bg-green-500 text-white hover:bg-green-600 border-b-4 border-green-700 active:border-b-0 active:translate-y-1",
    secondary: "bg-blue-500 text-white hover:bg-blue-600 border-b-4 border-blue-700 active:border-b-0 active:translate-y-1",
    danger: "bg-red-500 text-white hover:bg-red-600 border-b-4 border-red-700 active:border-b-0 active:translate-y-1",
    outline: "bg-white text-slate-600 border-2 border-slate-300 hover:bg-slate-50",
  };

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-6 py-2 text-sm",
    lg: "px-8 py-3 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};