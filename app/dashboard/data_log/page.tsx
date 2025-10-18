'use client';
import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function EventConsole() {
  const { data, error, isLoading } = useSWR('/api/datalog', fetcher, { refreshInterval: 2000 });
  const [openId, setOpenId] = useState<string | null>(null); // This tracks the currently open event

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading events.</div>;

  return (
    <div className="event-console">
      <div className="logTitle">Data Log</div>
      <ul className="event-list">
        {data?.map((event: any) => (
          <li key={event._id} className="event-item">
            <div
              className="eventTitle"
              onClick={() => setOpenId(openId === event._id ? null : event._id)}
            >
              <strong>{formatDate(event.timestamp)}: </strong>{event.type.replace(/_/g, ' ')}
            </div>
            {openId === event._id && (
              <div className="details">
                {Object.entries(event.details || {}).map(([key, value]) => (
                  <div key={key} className="event-detail-item">
                    {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
