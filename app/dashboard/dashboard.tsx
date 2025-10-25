'use client';

import useSWR from 'swr';
import './dashboard.css';
import Link from 'next/link';

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

  if (patientsLoading) return <div>Loading assignments...</div>;
  if (patientsError) return <div>Error loading assignments</div>;

  return (
    <div>
      <h1>Welcome, {username}</h1>
      <p className='dashTitle'>Active Assignments</p>
      {patients && patients.length > 0 ? (
        <ul>
          {patients.map((patient) => (
            <Link key={patient.deviceId} href={`/dashboard/patients/${patient.patientId}`}>
              <li className="patient-item">
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
