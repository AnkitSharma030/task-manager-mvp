'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CheckSquare, Layers, LayoutDashboard, LayoutTemplate, LogOut, Menu, Users, X } from 'lucide-react';

const navItems = [
    {
        name: 'Dashboard',
        href: '/',
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        name: 'Users',
        href: '/users',
        icon: <Users className="w-5 h-5" />,
    },
    {
        name: 'Templates',
        href: '/templates',
        icon: <LayoutTemplate className="w-5 h-5" />,
    },
    {
        name: 'Instances',
        href: '/instances',
        icon: <Layers className="w-5 h-5" />,
    },
    {
        name: 'Tasks',
        href: '/tasks',
        icon: <CheckSquare className="w-5 h-5" />,
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-border text-foreground cursor-pointer"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        sidebar z-50
        fixed lg:fixed
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Close button for mobile */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-muted/20 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Logo */}
                <div className="flex items-center gap-3 mb-8 px-2">

                    <div>
                        <h1 className="font-bold text-foreground">Task Manager</h1>
                        <p className="text-xs text-muted">Admin Panel</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* User info & Logout */}
                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                    {user && (
                        <div className="px-2 py-2 text-sm">
                            <p className="text-foreground font-medium truncate">{user.name}</p>
                            <p className="text-muted text-xs truncate">{user.email}</p>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="sidebar-link w-full text-danger hover:bg-danger/10 cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
