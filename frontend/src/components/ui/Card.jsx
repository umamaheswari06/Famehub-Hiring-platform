import React from 'react';
import { motion } from 'framer-motion';

export function Card({ className = '', children, hoverable = false, ...props }) {
  const baseClasses = "bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-300";
  
  if (hoverable) {
    return (
      <motion.div 
        whileHover={{ y: -4, scale: 1.01, boxShadow: '0 20px 25px -5px rgba(8, 86, 110, 0.08), 0 10px 10px -5px rgba(8, 86, 110, 0.04)' }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`${baseClasses} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`p-6 pb-4 border-b border-secondary/50 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={`font-semibold leading-none tracking-tight text-primary ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-6 pt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
