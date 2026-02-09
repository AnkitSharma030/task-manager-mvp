import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...', className = '' }) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px] ${className}`}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted">{message}</p>
        </div>
    );
}

export function Spinner({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
    };

    return <Loader2 className={`animate-spin text-primary ${sizeClasses[size]} ${className}`} />;
}
