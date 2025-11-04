'use client';

import useSWR from 'swr';
import './dashboard.css';
import Link from 'next/link';
import { useMemo } from 'react';

const fetcher = (url: string) => 
  fetch(url, {
    credentials: 'include'
  }).then((res) => res.json());

interface Patient {
  patientId: string;
  deviceId: string;
  name: string;
  timestamp: string;
  status: string;
}

const STATUS_PRIORITY: { [key: string]: number } = {
  'critical': 0,
  'warning': 1,
  'ok': 2
};

interface DashboardClientProps {
  username: string;
}

function formatStatus(status: string): string {
    switch (status) {
        case 'ok':
            return 'Okay';
        case 'warning':
            return 'Warning';
        case 'critical':
            return 'Critical';
        default:
            return 'Unknown';
    }
}

export default function Dashboard({ username }: DashboardClientProps) {
  const { data: patients, error: patientsError, isLoading: patientsLoading } = useSWR<Patient[]>(
    '/api/patients',
    fetcher,
    { refreshInterval: 500 }
  );

  const sortedPatients = useMemo(() => {
    if (!patients) return [];
    
    return [...patients].sort((a, b) => {
      const priorityA = STATUS_PRIORITY[a.status] ?? 999;
      const priorityB = STATUS_PRIORITY[b.status] ?? 999;
      return priorityA - priorityB;
    });
  }, [patients]);

  if (patientsLoading) return <div>Loading assignments...</div>;
  if (patientsError) return <div>Error loading assignments</div>;

  return (
    <div>
      <h1>Welcome, {username}</h1>
      <p className='dashTitle'>Active Assignments</p>
      {patients && patients.length > 0 ? (
        <ul>
          {sortedPatients.map((patient) => (
            <Link key={patient.deviceId} href={`/dashboard/patients/${patient.patientId}`}>
              <li className={patient.status === 'ok' ? 'patient-ok' :
                      patient.status === 'warning' ? 'patient-warning' :
                      patient.status === 'critical' ? 'patient-critical' : 'patient-ok'}>
                <p><strong>Patient ID</strong> <br />{patient.patientId}</p>
                <p><strong>Device ID</strong> <br />{patient.deviceId}</p>
                <div className="status">
                  <p><strong>Status</strong></p>
                  <p className={patient.status === 'ok' ? 'status-ok' :
                      patient.status === 'warning' ? 'status-warning' :
                      patient.status === 'critical' ? 'status-critical' : 'status-unknown'}>
                    <strong>{formatStatus(patient.status) || 'Unknown'}</strong>
                    </p>
                </div>
              </li>
            </Link>
          ))}
        </ul>
      ) : (
        <p>No active assignments</p>
      )}
    </div>
  );
}
