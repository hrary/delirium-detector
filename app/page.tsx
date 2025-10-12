// app/page.tsx (SERVER COMPONENT)
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
}
