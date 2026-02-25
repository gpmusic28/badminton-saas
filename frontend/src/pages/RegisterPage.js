import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', organization: '', role: 'organizer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  const fields = [
    { label: 'Full Name *', key: 'name', type: 'text' },
    { label: 'Email *', key: 'email', type: 'email' },
    { label: 'Password *', key: 'password', type: 'password' },
    { label: 'Phone', key: 'phone', type: 'tel' },
    { label: 'Organization / Club', key: 'organization', type: 'text' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2040 100%)', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>🏸</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e3a5f' }}>Create Account</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Join as organizer or umpire</p>
        </div>
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151', fontSize: 14 }}>{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                required={f.label.includes('*')} style={{ width: '100%', padding: '11px 14px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 15 }} />
            </div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151', fontSize: 14 }}>Role *</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 15 }}>
              <option value="organizer">Organizer (Run Tournaments)</option>
              <option value="umpire">Umpire (Score Matches)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: loading ? '#94a3b8' : '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
