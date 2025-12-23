// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { login } from '../utils/auth';

export default function LoginForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      onSuccess();                 
      window.location.replace('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, width: '90%', margin: '40px auto', padding: 16 }}>
      <h2>Log In</h2>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>
        Demo use: username <strong>test</strong>, password <strong>password</strong>
      </div>
      <div>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button type="submit" style={{ padding: '8px 16px' }}>
        Log In
      </button>
    </form>
  );
}
