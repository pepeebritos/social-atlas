import { cn } from '@/lib/utils';
import * as React from 'react';

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md bg-white text-black font-semibold px-4 py-2 text-sm hover:bg-gray-100 transition',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
