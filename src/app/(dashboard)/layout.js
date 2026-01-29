import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
