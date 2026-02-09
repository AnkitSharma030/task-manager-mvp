import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

const variants = {
    default: 'bg-background text-foreground border-border',
    destructive: 'bg-destructive/15 text-destructive border-destructive/50', // Shadcn uses destructive
    error: 'bg-red-500/15 text-red-600 border-red-500/50 dark:text-red-400', // Custom error
    success: 'bg-green-500/15 text-green-600 border-green-500/50 dark:text-green-400',
    warning: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/50 dark:text-yellow-400',
    info: 'bg-blue-500/15 text-blue-600 border-blue-500/50 dark:text-blue-400',
};

const icons = {
    default: Info,
    destructive: XCircle,
    error: XCircle,
    success: CheckCircle2,
    warning: AlertCircle,
    info: Info,
};

export function Alert({
    children,
    variant = 'default',
    className = '',
    title,
    ...props
}) {
    const Icon = icons[variant] || icons.default;
    const variantClass = variants[variant] || variants.default;

    return (
        <div
            role="alert"
            className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground flex items-start gap-3 ${variantClass} ${className}`}
            {...props}
        >
            <Icon className="h-5 w-5" />
            <div className="flex-1">
                {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
                <div className="text-sm [&_p]:leading-relaxed">{children}</div>
            </div>
        </div>
    );
}
