import React from 'react';
import { motion } from 'framer-motion';

export function Button({ className = '', variant = 'primary', size = 'md', children, disabled = false, ...props }) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-premium hover:shadow-lg transition-all",
    secondary: "bg-secondary text-slate-800 hover:bg-secondary-dark focus:ring-secondary shadow-sm",
    outline: "border-2 border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary focus:ring-primary shadow-sm transition-all",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-200 shadow-none",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 focus:ring-red-500 shadow-sm"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-8 py-3 text-base"
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  if (disabled) {
    return (
      <button className={classes} disabled {...props}>
        {children}
      </button>
    );
  }

  return (
    <motion.button 
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={classes}
      {...props}
    >
      {children}
    </motion.button>
  );
}
