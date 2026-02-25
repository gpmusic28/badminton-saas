import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const statusColor = { draft: '#f59e0b', published: '#3b82f6', in_progress: '#10b981', completed: '#6b7280' };
const statusLabel = { draft: 'Draft', published: 'Published', in_progress: 'In Progress', completed: 'Completed' };

export default function DashboardPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/tournaments/my').then(r => { setTournaments(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const publish = async (id) => {
    await API.put(`/tournaments/${id}/publish`);
    setTournaments(t => t.map(x => x._id === id ? { ...x, status: 'published' } : x));
  };

  const del = async (id) => {
    if (!window.confirm('Delete this tournament?')) return;
    await API.delete(`/tournaments/${id}`);
    setTournaments(t => t.filter(x => x._id !== id));
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>My Tournaments</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Welcome back, {user?.name}!</p>
        </div>
        <button onClick={() => navigate('/tournaments/create')} style={{ background: '#1e3a5f', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
          + Create Tournament
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div>
      ) : tournaments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: '#fff', borderRadius: 16, border: '2px dashed #e2e8f0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏸</div>
          <h3 style={{ color: '#1e293b', marginBottom: 8 }}>No tournaments yet</h3>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Create your first tournament to get started!</p>
          <button onClick={() => navigate('/tournaments/create')} style={{ background: '#1e3a5f', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
            Create Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {tournaments.map(t => (
            <div key={t._id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
              {t.logo && <img src={`http://localhost:3001${t.logo}`} alt="" style={{ width: '100%', height: 140, objectFit: 'cover' }} />}
              {!t.logo && <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🏸</div>}
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: 16, flex: 1 }}>{t.name}</h3>
                  <span style={{ background: statusColor[t.status] + '20', color: statusColor[t.status], fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 20, marginLeft: 8, whiteSpace: 'nowrap' }}>
                    {statusLabel[t.status]}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>📍 {t.venue}</p>
                <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>📅 {new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}</p>
                <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>{t.categories?.length || 0} categories</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => navigate(`/tournaments/${t._id}/manage`)} style={{ flex: 1, padding: '8px 12px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Manage</button>
                  <button onClick={() => navigate(`/tournaments/${t._id}/registrations`)} style={{ flex: 1, padding: '8px 12px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Entries</button>
                  {t.status === 'draft' && (
                    <button onClick={() => publish(t._id)} style={{ flex: 1, padding: '8px 12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Publish</button>
                  )}
                  <button onClick={() => del(t._id)} style={{ padding: '8px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
