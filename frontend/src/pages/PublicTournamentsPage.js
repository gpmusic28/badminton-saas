import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const statusColor = { published: '#3b82f6', in_progress: '#10b981', completed: '#6b7280' };
const statusLabel = { published: 'Open', in_progress: 'In Progress', completed: 'Completed' };

export default function PublicTournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/tournaments/public')
      .then(r => { setTournaments(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = tournaments.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.venue.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🏸</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#1e293b', marginBottom: 8 }}>
          Badminton Tournaments
        </h1>
        <p style={{ fontSize: 18, color: '#64748b', marginBottom: 28 }}>
          Find and register for tournaments near you
        </p>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by name or venue..."
          style={{ width: '100%', maxWidth: 480, padding: '14px 20px', border: '2px solid #e2e8f0', borderRadius: 50, fontSize: 15, outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>Loading tournaments...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: '#fff', borderRadius: 20, border: '2px dashed #e2e8f0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h3 style={{ color: '#1e293b', marginBottom: 8 }}>No tournaments found</h3>
          <p style={{ color: '#64748b' }}>Check back later or contact an organizer</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {filtered.map(t => (
            <div key={t._id} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', transition: 'transform 0.2s', cursor: 'pointer' }}
              onClick={() => navigate(`/tournaments/${t._id}/register`)}>
              {t.logo
                ? <img src={`http://localhost:3001${t.logo}`} alt="" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                : <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🏸</div>
              }
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <h3 style={{ fontWeight: 800, color: '#1e293b', fontSize: 17, flex: 1 }}>{t.name}</h3>
                  <span style={{ background: (statusColor[t.status] || '#6b7280') + '20', color: statusColor[t.status] || '#6b7280', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginLeft: 8, whiteSpace: 'nowrap' }}>
                    {statusLabel[t.status] || t.status}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 4 }}>📍 {t.venue}</p>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>
                  📅 {new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>{t.categories?.length || 0} categories</span>
                  {t.requirePayment && <span style={{ background: '#fefce8', color: '#854d0e', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>₹{t.entryFee}</span>}
                  {!t.requirePayment && <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>FREE</span>}
                </div>
                {t.organizerName && <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>By {t.organizerName}</p>}
              </div>
              <div style={{ padding: '0 24px 20px' }}>
                <button style={{ width: '100%', padding: '12px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Register Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
