'use client';

import Sidebar from './ui/sidebar';
import { usePatientMonitoring } from './hooks/usePatientMonitoring';
import { usePathname } from 'next/navigation';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '';
    const showSidebar = !pathname.includes('/login');
    usePatientMonitoring();

    return (
        <div>
            <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
                {showSidebar && (
                    <div className="w-full flex-none md:w-64">
                        <Sidebar />
                    </div>
                )}
                <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
            </div>
        </div>
    )
}
