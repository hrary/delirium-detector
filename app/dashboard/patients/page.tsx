'use client';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import useSWR from 'swr';
import './patients.css';
import { useState } from 'react';
import LineChart from './LineChart';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Patient {
  patientId: string;
  deviceId: string;
  name: string;
  timestamp: string;
  status: string;
}

interface VitalsEntry {
  deviceId: string;
  timestamp: string;
  heartRate?: number;
  o2Sat?: number;
  skinTemp?: number;
  accX?: number;
  accY?: number;
  accZ?: number;
  gyroX?: number;
  gyroY?: number;
  gyroZ?: number;
}

interface MultiAxisDataPoint {
  time: string;
  [key: string]: number | string;
}

function extractVital(
  latestEntries: VitalsEntry[],

  vitalKey: keyof VitalsEntry
): { time: string; value: number }[] {
  return latestEntries
    .filter(d => typeof d[vitalKey] === 'number')
    .map(d => ({
      time: d.timestamp,
      value: d[vitalKey] as number
    }));
}

function extractMultiAxisSeries(
  patientData: VitalsEntry[],
  keys: (keyof VitalsEntry)[]
): MultiAxisDataPoint[] {
  return patientData.map(d => {
    const entry: MultiAxisDataPoint = { time: d.timestamp };
    keys.forEach(key => {
      const rawValue = d[key];
      const numericValue = rawValue != null ? parseFloat(String(rawValue)) : NaN;

      if (isFinite(numericValue)) {
        entry[key] = numericValue;
      }
    });
    return entry;
  });
}

export default function Page() {
  const [patientId, setPatientId] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());

  const { data: patients, error, isLoading } = useSWR<Patient[]>('/api/patients', fetcher, { refreshInterval: 500 });
  const deviceIds = patients?.map(p => p.deviceId)
  const timestamps = patients?.map(p => p.timestamp);
  const numEntries = 50;
  const params = new URLSearchParams();
  deviceIds?.forEach(id => params.append('deviceIds', id));
  timestamps?.forEach(ts => params.append('timestamps', ts));
  params.append('N', numEntries.toString());
  const queryString = params.toString();
  const { data: data } = useSWR(`/api/data?${queryString}`, fetcher, { refreshInterval: 500 });

  const wS = 275;
  const hS = 275;


  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data.</div>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setTimestamp(Date.now());
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, deviceId, timestamp: new Date(timestamp) }),
    });
    if (res.ok) {
      setPatientId('');
      setDeviceId('');
      setSuccessMessage('Success!');
    } else {
      const data = await res.json();
      setErrorMessage(data.error || 'Failed to add patient');
    }
  }

  return (
    <main>
      <div>
        <h1 className="patientTitle">Patients</h1>
      </div>

      {/* Patient Adder ------------------------------------------------ */}
      <div className="patientEditor">
        <div className="subtitle">
          Add a patient:
        </div>
        <form className="patientForm" onSubmit={handleSubmit}>
          <label className='inputLabel'>
            Patient ID:
            <input
              type="text"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              autoComplete="off"
              required
              className='inputField'
            />
          </label>
          <label className='inputLabel'>
            Device ID:
            <input
              type="text"
              value={deviceId}
              onChange={e => setDeviceId(e.target.value)}
              autoComplete="off"
              required
              className='inputField'
            />
          </label>
          <button className="addPatientButton" type='submit'>Add Patient</button>
        </form>
        {errorMessage && <p className="errorMessage">{errorMessage}</p>}
        {successMessage && <p className="successMessage">{successMessage}</p>}
      </div>

      {/* Patient List ------------------------------------------------ */}
      <div>
        {patients
          ?.slice() // copy so you don't mutate the state idk what this does
          .sort((a, b) => a.patientId.localeCompare(b.patientId))
          .map((patient: any) => {
            const patientData = data?.filter((d: any) => d.deviceId === patient.deviceId) ?? [];
            const patientDataArr = data?.filter((d: any) => d.deviceId == patient.deviceId) ?? [];
            const latestData = patientDataArr[0]?.latestEntries ?? [];
            const heartRateSeries = extractVital(latestData, 'heartRate');
            const o2Series = extractVital(latestData, 'o2Sat');
            const tempSeries = extractVital(latestData, 'skinTemp');
            const accSeries = extractMultiAxisSeries(latestData, ['accX', 'accY', 'accZ']);
            const gyroSeries = extractMultiAxisSeries(latestData, ['gyroX', 'gyroY', 'gyroZ']);
            return (
              <Link key={patient.deviceId} href={`/dashboard/patients/${patient.patientId}`} className="patientLink">
                <div className="patientDisplay">
                  <div className="patientHeader">
                    <p className="subtitle">Patient ID: {patient.patientId}</p>
                    <p className="subtitle">Device ID: {patient.deviceId}</p>
                  </div>
                  {patientData.length > 0 ? (
                    <div className="chartsContainer">
                      <LineChart
                        dataArray={heartRateSeries.reverse()}
                        lines={['value']}
                        labels={['Heart Rate']}
                        width={wS}
                        height={hS}
                        color="rgb(255, 99, 132)"
                      />
                      <LineChart
                        dataArray={o2Series.reverse()}
                        lines={['value']}
                        labels={['O2 Saturation']}
                        width={wS}
                        height={hS}
                        color="rgb(54, 162, 235)"
                      />
                      <LineChart
                        dataArray={tempSeries.reverse()}
                        lines={['value']}
                        labels={['Temperature']}
                        width={wS}
                        height={hS}
                        color="rgb(255, 206, 86)"
                      />
                      <LineChart
                        dataArray={accSeries.reverse()}
                        lines={['accX', 'accY', 'accZ']}
                        labels={['Acc X', 'Acc Y', 'Acc Z']}
                        width={400}
                        height={300}
                        colors={['rgba(170, 51, 177, 1)', 'rgb(54, 162, 235)', 'rgba(40, 147, 69, 1)']}
                      />
                      <LineChart
                        dataArray={gyroSeries.reverse()}
                        lines={['gyroX', 'gyroY', 'gyroZ']}
                        labels={['Gyro X', 'Gyro Y', 'Gyro Z']}
                        width={400}
                        height={300}
                        colors={['rgba(228, 46, 188, 1)', 'rgba(86, 246, 243, 1)', 'rgba(90, 238, 162, 1)']}
                      />
                    </div>
                  ) : (
                    <p>No data found for this patient.</p>
                  )}
                </div>
              </Link>
            );
          })}
      </div>
    </main>
  )
}
