export function Avatar({
    src,
    name,
    alt,
    size = 'md',
    className = ''
}) {
    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'h-8 w-8 text-xs';
            case 'lg': return 'h-12 w-12 text-lg';
            case 'xl': return 'h-16 w-16 text-xl';
            default: return 'h-10 w-10 text-sm'; // md
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div
            className={`relative flex shrink-0 overflow-hidden rounded-full bg-muted/20 items-center justify-center font-semibold text-muted-foreground ${getSizeClasses()} ${className}`}
        >
            {src ? (
                <img
                    className="aspect-square h-full w-full object-cover"
                    src={src}
                    alt={alt || name || 'Avatar'}
                />
            ) : (
                <span>{getInitials(name)}</span>
            )}
        </div>
    );
}
