'use client';

import { useState } from "react";
import './users.css';
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Page() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const { data: users, error, mutate } = useSWR('/api/users', fetcher, { refreshInterval: 500 });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role: role || 'user' }),
        });
        if (res.ok) {
            setUsername('');
            setPassword('');
            setRole('');
            setSuccessMessage('Success!');
        } else {
            const data = await res.json();
            setErrorMessage(data.error || 'Failed to add user');
        }
    }

    async function handleDelete(username: string) {
        const res = await fetch(`/api/users`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });

        if (res.ok) {
            // User deleted successfully
            mutate('/api/users'); // Refresh the user list
        } else {
            const data = await res.json();
            setErrorMessage(data.error || 'Failed to delete user');
        }
    }

    return (
        <div>
            <h1>User Management</h1>

            <div className="userEditor">
                <div className="subtitle">
                    Add a user:
                </div>
                <form className="userForm" onSubmit={handleSubmit}>
                    <label className='inputLabel'>
                        Username:
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="off"
                            required
                            className='inputField'
                        />
                    </label>
                    <label className='inputLabel'>
                        Password:
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="off"
                            required
                            className='inputField'
                        />
                    </label>
                    <label className='inputLabel'>
                        Is Admin?
                        <input type="checkbox" id="role" className='inputField' name="role" value="admin" checked={role === 'admin'} onChange={e => setRole(e.target.checked ? 'admin' : 'user')} />

                    </label>
                    <button className="addUserButton" type='submit'>Add User</button>
                </form>
                {errorMessage && <p className="errorMessage">{errorMessage}</p>}
                {successMessage && <p className="successMessage">{successMessage}</p>}
            </div>

            <div>
                <h2 className="userListTitle">Existing Users:</h2>
                {error && <p className="errorMessage">Failed to load users</p>}
                {!users ? (<p>Loading...</p>) : (
                    <ul className="userList">
                        {users.map((user: { _id: string; username: string; role: string }) => (
                            <li key={user.username} className="userListItem">
                                <span ><strong>Username:</strong> {user.username}</span>
                                <span ><strong>Role:</strong> {user.role}</span>
                                <span ><button className="deleteButton" onClick={() => handleDelete(user.username)}>Delete User</button></span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

    );
}
