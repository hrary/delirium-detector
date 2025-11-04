"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAlert } from '../context/AlertContext';
import { useState, useEffect } from 'react';
import './sidebar.css';

export default function Sidebar() {

  const router = useRouter();
  const { criticalAlert } = useAlert();
  const [isCritical, setIsCritical] = useState(false);

  const playSound = () => {
    const audio = new Audio('/criticalAlert5.mp3');
    audio.volume = 1.0;
    audio.play();
  }

  useEffect(() => {
    if (criticalAlert) {
      setIsCritical(true);
      playSound();
      const timer = setTimeout(() => {
        setIsCritical(false);
      }, 5000);


      return () => clearTimeout(timer);
    }
    else {
      setIsCritical(false);
    }
  }, [criticalAlert]);

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
          <Link href="/dashboard" className={isCritical ? 'critical-flash' : 'sidebar-link'}>
            Dashboard
          </Link>
          <Link href="/dashboard/patients" className="sidebar-link">
            Patients
          </Link>
          <Link href="/dashboard/users" className="sidebar-link">
            Users
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
