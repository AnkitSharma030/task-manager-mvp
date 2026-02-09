import { Button } from './Button';

export function IconButton({ children, className = '', ...props }) {
    return (
        <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 rounded-full ${className}`}
            {...props}
        >
            {children}
        </Button>
    );
}
