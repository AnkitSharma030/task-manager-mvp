export function PageHeader({ title, description, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
                {description && <p className="text-muted mt-1">{description}</p>}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
}

export function EmptyState({ icon, title, description, action }) {
    return (
        <div className="card text-center py-12">
            {icon && <div className="flex justify-center mb-4 text-muted">{icon}</div>}
            <h3 className="font-medium text-foreground mb-1">{title}</h3>
            {description && <p className="text-muted text-sm mb-4">{description}</p>}
            {action}
        </div>
    );
}

export function LoadingState({ message = 'Loading...' }) {
    return (
        <div className="text-center py-12 text-muted">
            <div className="flex justify-center mb-2">
                <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            </div>
            {message}
        </div>
    );
}
