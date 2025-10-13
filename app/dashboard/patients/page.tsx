'use client';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import useSWR from 'swr';
import './patients.css';
import { useState } from 'react';
import LineChart from './LineChart';

const fetcher = (url:string) => fetch(url).then(res => res.json());

interface Patient {
  patientId: string;
  deviceID: string;
  name: string;
  timestamp: string;
}

interface VitalsEntry {
  deviceID: string;
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
  patientData: VitalsEntry[],
  vitalKey: keyof VitalsEntry
): { time: string; value: number }[] {
  return patientData
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
  const [deviceID, setDeviceID] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());

  const { data: patients, error, isLoading } = useSWR<Patient[]>('/api/patients', fetcher, { refreshInterval: 500 });
  const deviceIDs = patients?.map(p => p.deviceID)
  const timestamps = patients?.map(p => p.timestamp);
  const params = new URLSearchParams();
  deviceIDs?.forEach(id => params.append('deviceIDs', id));
  timestamps?.forEach(ts => params.append('timestamps', ts));
  const queryString = params.toString();
  const { data: data} = useSWR(`/api/data?${queryString}`, fetcher, { refreshInterval: 500 });

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
      body: JSON.stringify({ patientId, deviceID, timestamp: new Date(timestamp) }),
    });
    if (res.ok) {
      setPatientId('');
      setDeviceID('');
      setSuccessMessage('Success!');
    } else {
      const data = await res.json();
      setErrorMessage(data.error || 'Failed to add patient');
    }
  }

  return (
    <main>
      <div>
        <h2 className="patientTitle">Patients</h2>
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
              value={deviceID}
              onChange={e => setDeviceID(e.target.value)}
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
            const patientData = data?.filter((d: any) => d.deviceID === patient.deviceID) ?? [];
            const heartRateSeries = extractVital(patientData, 'heartRate');
            const o2Series = extractVital(patientData, 'o2Sat');
            const tempSeries = extractVital(patientData, 'skinTemp');
            const accSeries = extractMultiAxisSeries(patientData, ['accX', 'accY', 'accZ']);
            const gyroSeries = extractMultiAxisSeries(patientData, ['gyroX', 'gyroY', 'gyroZ']);
            return (
              <div key={patient.deviceID} className="patientDisplay">
                <div className="patientHeader">
                  <p className="subtitle">Patient ID: {patient.patientId}</p>
                  <p className="subtitle">Device ID: {patient.deviceID}</p>
                </div>
                {patientData.length > 0 ? (
                  <div className="chartsContainer">
                    <LineChart
                      dataArray={heartRateSeries}
                      lines={['value']}
                      labels={['Heart Rate']}
                      width={wS}
                      height={hS}
                      color="rgb(255, 99, 132)"
                    />
                    <LineChart
                      dataArray={o2Series}
                      lines={['value']}
                      labels={['O2 Saturation']}
                      width={wS}
                      height={hS}
                      color="rgb(54, 162, 235)"
                    />
                    <LineChart
                      dataArray={tempSeries}
                      lines={['value']}
                      labels={['Temperature']}
                      width={wS}
                      height={hS}
                      color="rgb(255, 206, 86)"
                    />
                    <LineChart
                      dataArray={accSeries}
                      lines={['accX', 'accY', 'accZ']}
                      labels={['Acc X', 'Acc Y', 'Acc Z']}
                      width={400}
                      height={300}
                      colors={['rgba(170, 51, 177, 1)', 'rgb(54, 162, 235)', 'rgba(40, 147, 69, 1)']}
                    />
                    <LineChart
                      dataArray={gyroSeries}
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
            );
          })}
      </div>
    </main>
  )
}
