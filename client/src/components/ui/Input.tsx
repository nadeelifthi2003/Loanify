import React, { useId } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, leftIcon, rightIcon, id, containerClassName, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id || generatedId;

        return (
            <div className={cn("w-full space-y-1.5", containerClassName)}>
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        className={cn(
                            'w-full rounded-lg border bg-white dark:bg-dark-surface px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200',
                            error
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-slate-300 dark:border-slate-600 focus:border-primary',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {(error || helperText) && (
                    <p className={cn('text-xs', error ? 'text-red-500' : 'text-slate-500')}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';
