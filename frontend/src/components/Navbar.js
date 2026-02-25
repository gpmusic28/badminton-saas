import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const C = { bg: '#0b1220', brand: '#00d4ff', text: '#f1f5f9', sub: '#64748b', border: 'rgba(255,255,255,0.07)' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: '0 24px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontSize: 24 }}>🏸</span>
          <span style={{ color: C.text, fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>Tournament Pro</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/dashboard" style={{ color: C.text, textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 0', borderBottom: '2px solid transparent', transition: 'all 0.2s' }}>
            Dashboard
          </Link>
          <Link to="/tournaments/create" style={{ color: C.text, textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 0', borderBottom: '2px solid transparent', transition: 'all 0.2s' }}>
            Create Tournament
          </Link>
          {(user?.role === 'org_admin' || user?.role === 'super_admin') && (
            <Link to="/team" style={{ color: C.text, textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 0', borderBottom: '2px solid transparent', transition: 'all 0.2s' }}>
              Team
            </Link>
          )}
          <Link to="/umpire" target="_blank" style={{ color: C.brand, textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 0' }}>
            Umpire Portal
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 12, paddingLeft: 24, borderLeft: `1px solid ${C.border}` }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ color: C.sub, fontSize: 11 }}>{user?.role?.replace('_', ' ')}</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'rgba(255,23,68,0.1)', color: '#ff1744', border: '1px solid rgba(255,23,68,0.3)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
