'use client';

import { useEffect, useRef } from 'react';
import useSWR from 'swr';
import { useAlert } from '../context/AlertContext';

const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((res) => res.json());

interface Patient {
  patientId: string;
  deviceId: string;
  name: string;
  timestamp: string;
  status: string;
}

export const usePatientMonitoring = () => {
  const { data: patients } = useSWR(
    '/api/patients',
    fetcher,
    { refreshInterval: 500 }
  );

  const { triggerCriticalAlert, clearAlert } = useAlert();
  const previousStatusRef = useRef<{ [key: string]: string }>({});

  useEffect(() => {
    if (!patients) return;

    patients.forEach((patient: Patient) => {
      const previousStatus = previousStatusRef.current[patient.patientId];

      if (previousStatus !== 'critical' && patient.status === 'critical') {
        triggerCriticalAlert({
          patientId: patient.patientId,
          patientName: patient.name,
          timestamp: new Date(),
        });
      }

      // Clear alert if status changed FROM critical
      if (previousStatus === 'critical' && patient.status !== 'critical') {
        clearAlert();
      }

      previousStatusRef.current[patient.patientId] = patient.status;
    });
  }, [patients, triggerCriticalAlert, clearAlert]);

  return { patients };
};
