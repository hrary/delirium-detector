"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar() {

  const router = useRouter();
  
  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside>
      <div className="sidebar-root">
        <div className="sidebar-logo">
          <img src="/WRHNLogo.png" alt="Logo" />
        </div>
        <nav className="pages-container">
          <Link href="/dashboard" className="sidebar-link">
            Dashboard
          </Link>
          <Link href="/dashboard/patients" className="sidebar-link">
            Patients
          </Link>
          <Link href="/dashboard/event_log" className="sidebar-link">
            System Log
          </Link>
          <Link href="/dashboard/data_log" className="sidebar-link">
            Data Log
          </Link>
          <Link href="/dashboard/about" className="sidebar-link">
            About
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout">Log Out</button>
        </div>
      </div>
    </aside>
  );
}
