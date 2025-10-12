
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './login.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
            router.push('/dashboard');
        } else {
            const data = await res.json();
            setError(data.error || 'Invalid username or password');
        }
    }

    return (
        <main className="container">
            <div className="loginForm">
                <div className="loginComponent">
                    <Image src="/WRHNLogo.png" alt="Logo" width={400} height={400} />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className='loginComponent'>
                        <label className='inputLabel'>
                            Username:
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                                className='inputField'
                            />
                        </label>
                    </div>
                    <div className='loginComponent'>
                        <label className='inputLabel'>
                            Password:
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                                className='inputField'
                            />
                        </label>
                    </div>
                    <button type="submit" className='loginButton'>Log In</button>
                </form>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </main>
    );
}
