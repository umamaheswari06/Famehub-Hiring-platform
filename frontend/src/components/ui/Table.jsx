import React from 'react';
import { motion } from 'framer-motion';

export function Table({ className = '', children, ...props }) {
  return (
    <div className="w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = '', children, ...props }) {
  return (
    <thead className={`bg-slate-50 border-b border-slate-200 ${className}`} {...props}>
      {children}
    </thead>
  );
}

const tableBodyVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export function TableBody({ className = '', children, ...props }) {
  // Convert standard elements to animated elements if children is an array
  return (
    <motion.tbody 
      variants={tableBodyVariants}
      initial="hidden"
      animate="show"
      className={`[&_tr:last-child]:border-0 ${className}`} 
      {...props}
    >
      {children}
    </motion.tbody>
  );
}

const tableRowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function TableRow({ className = '', children, ...props }) {
  return (
    <motion.tr 
      variants={tableRowVariants}
      className={`border-b border-slate-100 transition-colors hover:bg-slate-50 data-[state=selected]:bg-slate-100 ${className}`} 
      {...props}
    >
      {children}
    </motion.tr>
  );
}

export function TableHead({ className = '', children, ...props }) {
  return (
    <th className={`h-12 px-4 text-left align-middle font-medium text-slate-600 uppercase text-xs tracking-wider ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className = '', children, ...props }) {
  return (
    <td className={`p-4 align-middle text-slate-600 ${className}`} {...props}>
      {children}
    </td>
  );
}
