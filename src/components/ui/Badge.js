export function Badge({ children, variant = 'default', className = '' }) {
    const variants = {
        default: 'bg-muted/20 text-muted',
        admin: 'badge-admin',
        member: 'badge-member',
        primary: 'bg-primary/20 text-primary',
        success: 'bg-success/20 text-success',
        warning: 'bg-warning/20 text-warning',
        danger: 'bg-danger/20 text-danger',
    };

    return (
        <span className={`badge ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}

export function Avatar({ name, size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-6 h-6 text-xs',
        md: 'w-8 h-8 text-sm',
        lg: 'w-10 h-10 text-base',
    };

    const initial = name?.charAt(0)?.toUpperCase() || '?';

    return (
        <div className={`rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium ${sizes[size]} ${className}`}>
            {initial}
        </div>
    );
}

export function Alert({ children, variant = 'info', className = '' }) {
    const variants = {
        info: 'bg-primary/10 border-primary/30 text-blue-400',
        success: 'bg-success/10 border-success/30 text-green-400',
        warning: 'bg-warning/10 border-warning/30 text-yellow-400',
        error: 'bg-danger/10 border-danger/30 text-red-400',
    };

    return (
        <div className={`p-4 rounded-xl border ${variants[variant]} text-sm ${className}`}>
            {children}
        </div>
    );
}

export function Spinner({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <svg className={`animate-spin ${sizes[size]} ${className}`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}
