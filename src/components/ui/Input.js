export function Input({
    label,
    error,
    className = '',
    ...props
}) {
    return (
        <div className="w-full">
            {label && <label className="label">{label}</label>}
            <input className={`input ${error ? 'border-danger' : ''} ${className}`} {...props} />
            {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </div>
    );
}

export function Select({
    label,
    error,
    options = [],
    placeholder,
    className = '',
    ...props
}) {
    return (
        <div className="w-full">
            {label && <label className="label">{label}</label>}
            <select className={`select ${error ? 'border-danger' : ''} ${className}`} {...props}>
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </div>
    );
}

export function Textarea({
    label,
    error,
    className = '',
    ...props
}) {
    return (
        <div className="w-full">
            {label && <label className="label">{label}</label>}
            <textarea
                className={`input min-h-[100px] resize-y ${error ? 'border-danger' : ''} ${className}`}
                {...props}
            />
            {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </div>
    );
}
