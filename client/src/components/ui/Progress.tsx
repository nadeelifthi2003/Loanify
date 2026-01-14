import React from 'react';
import { cn } from '@/utils/cn';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    max?: number;
    indicatorClassName?: string;
}

export const Progress = ({ className, value = 0, max = 100, indicatorClassName, ...props }: ProgressProps) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div
            className={cn(
                'relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
                className
            )}
            {...props}
        >
            <div
                className={cn(
                    'h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out',
                    indicatorClassName
                )}
                style={{ transform: `translateX(-${100 - percentage}%)` }}
            />
        </div>
    );
};
