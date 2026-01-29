export function Table({ children, className = '' }) {
    return (
        <div className="table-container">
            <table className={className}>
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children }) {
    return <thead>{children}</thead>;
}

export function TableBody({ children }) {
    return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
    return <tr className={className}>{children}</tr>;
}

export function TableHead({ children, className = '' }) {
    return <th className={className}>{children}</th>;
}

export function TableCell({ children, className = '' }) {
    return <td className={className}>{children}</td>;
}

export function TableEmpty({ message = 'No data found', colSpan = 1 }) {
    return (
        <tr>
            <td colSpan={colSpan} className="text-center py-8 text-muted">
                {message}
            </td>
        </tr>
    );
}
