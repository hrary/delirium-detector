'use client';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import useSWR from 'swr';
import '../patients.css';
import './individualPages.css';
import LineChart from '../LineChart';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Patient {
    patientId: string;
    deviceId: string;
    name: string;
    timestamp: string;
}

interface VitalsEntry {
    deviceId: string;
    timestamp: string;
    HR?: number;
    SpO2?: number;
    Temp?: number;
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
    const params = useParams() || {};
    const patientId = params.patientId as string;
    const router = useRouter();

    async function handleDeletePatient(patientId: string) {
        const confirmed = window.confirm("Are you sure you want to delete this patient? This action cannot be undone (without causing a huge headache).");
        if (confirmed) {
            await fetch(`/api/patients/`, {
                method: 'DELETE',
                credentials: 'include',
                body: JSON.stringify({ patientId }),
            });
            router.push('/dashboard/patients');
        }
    };

    const [activeView, setActiveView] = useState<'graphs' | 'table'>('graphs');

    const { data: patients, error: patientsError, isLoading: patientsLoading } = useSWR<Patient[]>(
        '/api/patients',
        fetcher,
        { refreshInterval: 500 }
    );

    const patient = patients?.find(p => p.patientId === patientId);

    const numEntries = 120;
    const apiParams = new URLSearchParams();
    if (patient?.deviceId) {
        apiParams.append('deviceIds', patient.deviceId);
        apiParams.append('timestamps', patient.timestamp);
        apiParams.append('N', numEntries.toString());
    }
    const queryString = apiParams.toString();

    const { data: data } = useSWR(
        patient ? `/api/data?${queryString}` : null,
        fetcher,
        { refreshInterval: 500 }
    );

    const wS = 800;
    const hS = 400;

    // Scroll helper from copilot
    function scrollToTop() {
        try {
            // Prefer the dashboard content container which uses `flex-grow` + `md:overflow-y-auto`.
            const preferred = document.querySelector('.flex-grow') as HTMLElement | null;
            if (preferred && preferred.scrollHeight > preferred.clientHeight) {
                preferred.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // Otherwise look for any ancestor with scrollable overflow
            const mainEl = document.querySelector('main') as HTMLElement | null;
            let cur = mainEl;
            while (cur) {
                const style = window.getComputedStyle(cur);
                if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                    cur.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                cur = cur.parentElement as HTMLElement | null;
            }

            // Fallback to window
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            // In case of any error, fallback to window
            window.scrollTo({ top: 0 });
        }
    }

    if (patientsLoading) return <div>Loading patient information...</div>;
    if (patientsError) return <div>Error loading patient data.</div>;
    if (!patient) return <div>Patient not found.</div>;

    const patientDataArr = data?.filter((d: any) => d.deviceId === patient.deviceId) ?? [];
    const latestData = patientDataArr[0]?.latestEntries ?? [];
    const heartRateSeries = extractVital(latestData, 'HR');
    const o2Series = extractVital(latestData, 'SpO2');
    const tempSeries = extractVital(latestData, 'Temp');
    const accSeries = extractMultiAxisSeries(latestData, ['accX', 'accY', 'accZ']);
    const gyroSeries = extractMultiAxisSeries(latestData, ['gyroX', 'gyroY', 'gyroZ']);

    return (
        <main>
            <Link href="/dashboard/patients" className="backLink">
                ← Back to All Patients
            </Link>

            <h1>Patient Details ({patient.patientId})</h1>

            <div className="infoHeader">
                <p><strong>Patient ID:</strong> {patient.patientId}</p>
                <p><strong>Registration time:</strong> {new Date(patient.timestamp as string).toLocaleString()}</p>
                <p><strong>Device ID:</strong> {patient.deviceId}</p>
                <button className="deletePatient" onClick={() => handleDeletePatient(patient.patientId)}>
                    Delete Patient
                </button>
                {patient.name && <p><strong>Name:</strong> {patient.name}</p>}
            </div>

            <div className="viewToggle">
                <button onClick={() => setActiveView('graphs')} className={`tabButton ${activeView === 'graphs' ? 'active' : ''}`}>
                    📊 Graphs
                </button>
                <button onClick={() => setActiveView('table')} className={`tabButton ${activeView === 'table' ? 'active' : ''}`}>
                    📋 Data Table
                </button>
            </div>

            {activeView === 'graphs' && (
                latestData.length > 0 ? (
                    <div className="largeChartsContainer">
                        <p className="chartTitle">Heart Rate</p>
                        <LineChart
                            dataArray={heartRateSeries.reverse()}
                            lines={['value']}
                            labels={['Heart Rate']}
                            width={wS}
                            height={hS}
                            color="rgb(255, 99, 132)"
                        />
                        <p className="chartTitle">O2 Saturation</p>
                        <LineChart
                            dataArray={o2Series.reverse()}
                            lines={['value']}
                            labels={['O2 Saturation']}
                            width={wS}
                            height={hS}
                            color="rgb(54, 162, 235)"
                        />
                        <p className="chartTitle">Temperature</p>
                        <LineChart
                            dataArray={tempSeries.reverse()}
                            lines={['value']}
                            labels={['Temperature']}
                            width={wS}
                            height={hS}
                            color="rgb(255, 206, 86)"
                        />
                        <p className="chartTitle">Acceleration</p>

                        <LineChart
                            dataArray={accSeries.reverse()}
                            lines={['accX', 'accY', 'accZ']}
                            labels={['Acc X', 'Acc Y', 'Acc Z']}
                            width={wS}
                            height={hS}
                            colors={['rgba(170, 51, 177, 1)', 'rgb(54, 162, 235)', 'rgba(40, 147, 69, 1)']}
                        />
                        <p className="chartTitle">Orientation</p>
                        <LineChart
                            dataArray={gyroSeries.reverse()}
                            lines={['gyroX', 'gyroY', 'gyroZ']}
                            labels={['Gyro X', 'Gyro Y', 'Gyro Z']}
                            width={wS}
                            height={hS}
                            colors={['rgba(228, 46, 188, 1)', 'rgba(86, 246, 243, 1)', 'rgba(90, 238, 162, 1)']}
                        />
                    </div>
                ) : (
                    <p>No data packets found for this patient.</p>
                )
            )}

            {activeView === 'table' && (
                latestData.length > 0 ? (
                    <div className="dataTableWrapper">
                        <table className="dataTable">
                            <thead className="dataTableHead">
                                <tr>
                                    <th className="dataTableHeader">Timestamp</th>
                                    <th className="dataTableHeader">Heart Rate</th>
                                    <th className="dataTableHeader">O2 Sat (%)</th>
                                    <th className="dataTableHeader">Skin Temp (°C)</th>
                                    <th className="dataTableHeader">Acc X</th>
                                    <th className="dataTableHeader">Acc Y</th>
                                    <th className="dataTableHeader">Acc Z</th>
                                    <th className="dataTableHeader">Gyro X</th>
                                    <th className="dataTableHeader">Gyro Y</th>
                                    <th className="dataTableHeader">Gyro Z</th>
                                </tr>
                            </thead>
                            <tbody>
                                {latestData.map((entry: VitalsEntry, index: number) => (
                                    <tr className="dataTableRow" key={index}>
                                        <td className="dataTableCell">{new Date(entry.timestamp).toLocaleString()}</td>
                                        <td className="dataTableCell">{entry.HR ?? '-'}</td>
                                        <td className="dataTableCell">{entry.SpO2 ?? '-'}</td>
                                        <td className="dataTableCell">{entry.Temp ?? '-'}</td>
                                        <td className="dataTableCell">{entry.accX?.toFixed(2) ?? '-'}</td>
                                        <td className="dataTableCell">{entry.accY?.toFixed(2) ?? '-'}</td>
                                        <td className="dataTableCell">{entry.accZ?.toFixed(2) ?? '-'}</td>
                                        <td className="dataTableCell">{entry.gyroX?.toFixed(2) ?? '-'}</td>
                                        <td className="dataTableCell">{entry.gyroY?.toFixed(2) ?? '-'}</td>
                                        <td className="dataTableCell">{entry.gyroZ?.toFixed(2) ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No data packets found for this patient.</p>
                )
            )}

            <button className="backToTopButton" onClick={scrollToTop}>
                ↑ Back to Top
            </button>

        </main>
    );
}