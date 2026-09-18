import React from 'react';
import { motion } from 'framer-motion';

export function Badge({ className = '', variant = 'default', children, ...props }) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#08566E] focus:ring-offset-2";
  
  const variants = {
    default: "bg-primary/10 text-primary border border-primary/20",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    neutral: "bg-slate-100 text-slate-600 border border-slate-200"
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={classes} 
      {...props}
    >
      {children}
    </motion.div>
  );
}
