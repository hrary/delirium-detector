import "@/app/dashboard/event_log/eventlog.css";

export default function LogLayout({ children }: { children: React.ReactNode }) {
  return <div className="log-layout">{children}</div>;
}