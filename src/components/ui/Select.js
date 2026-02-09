import { ChevronDown } from 'lucide-react';

export function Select({
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Select an option',
    error,
    required = false,
    className = '',
    ...props
}) {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
                    {label} {required && <span className="text-danger">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    value={value || ''}
                    onChange={onChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    {...props}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
        </div>
    );
}
