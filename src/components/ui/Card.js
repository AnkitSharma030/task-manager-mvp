export function Card({ children, className = '', hover = true }) {
    return (
        <div className={`card ${hover ? '' : 'hover:transform-none hover:shadow-none'} ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`flex items-start justify-between mb-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '' }) {
    return (
        <h3 className={`font-semibold text-foreground text-lg ${className}`}>
            {children}
        </h3>
    );
}

export function CardDescription({ children, className = '' }) {
    return (
        <p className={`text-muted text-sm mt-1 ${className}`}>
            {children}
        </p>
    );
}

export function CardContent({ children, className = '' }) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }) {
    return (
        <div className={`mt-4 pt-4 border-t border-border ${className}`}>
            {children}
        </div>
    );
}
