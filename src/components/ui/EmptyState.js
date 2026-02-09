import { FileX2 } from 'lucide-react';

export function EmptyState({
    title = 'No data found',
    description = 'Try creating something new.',
    icon: Icon = FileX2,
    children,
    className = ''
}) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-lg bg-card/50 min-h-[300px] ${className}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-4">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted mb-6 max-w-sm">{description}</p>
            {children}
        </div>
    );
}
