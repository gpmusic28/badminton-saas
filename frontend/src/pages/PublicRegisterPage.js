import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';

export default function PublicRegisterPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ tournamentId: id, categoryName: '', teamName: '', player1Name: '', player1Email: '', player1Mobile: '', player1Coach: '', player1Arena: '', player2Name: '', player2Email: '', player2Mobile: '', player2Coach: '', player2Arena: '', paymentAmount: '' });

  useEffect(() => { API.get(`/tournaments/public/${id}`).then(r => { setTournament(r.data); setLoading(false); }).catch(() => setLoading(false)); }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedCat = tournament?.categories?.find(c => c.name === form.categoryName);
  const isDoubles = selectedCat?.type === 'doubles';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (file) fd.append('paymentScreenshot', file);
      const res = await API.post('/registrations/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Submission failed'); }
    setSubmitting(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}>Loading...</div>;
  if (!tournament) return <div style={{ textAlign: 'center', padding: 80 }}>Tournament not found</div>;

  if (success) return (
    <div style={{ maxWidth: 500, margin: '60px auto', padding: 20, textAlign: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 48, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#065f46', marginBottom: 12 }}>Registration Submitted!</h2>
        <p style={{ color: '#64748b', marginBottom: 20 }}>Your registration is pending approval from the organizer. Keep your registration ID safe:</p>
        <div style={{ background: '#d1fae5', borderRadius: 10, padding: 16, fontSize: 18, fontWeight: 700, color: '#065f46', fontFamily: 'monospace' }}>{success.id}</div>
        <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 16 }}>You'll be notified once approved</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>
      {/* Tournament Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', borderRadius: 16, padding: 28, marginBottom: 28, color: '#fff', textAlign: 'center' }}>
        {tournament.logo && <img src={`http://localhost:3001${tournament.logo}`} alt="" style={{ height: 70, borderRadius: 8, marginBottom: 12 }} />}
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{tournament.name}</h1>
        <p style={{ opacity: 0.85 }}>📍 {tournament.venue} &nbsp;|&nbsp; 📅 {new Date(tournament.startDate).toLocaleDateString()} – {new Date(tournament.endDate).toLocaleDateString()}</p>
        {tournament.requirePayment && <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 16px', display: 'inline-block' }}>Entry Fee: <strong>₹{tournament.entryFee}</strong></div>}
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 16, borderRadius: 10, marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Category */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>🏷️ Category</h3>
          <select value={form.categoryName} onChange={e => set('categoryName', e.target.value)} required style={{ width: '100%', padding: '12px 14px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 15 }}>
            <option value="">Select Category</option>
            {tournament.categories?.map(c => <option key={c._id} value={c.name}>{c.name} ({c.type})</option>)}
          </select>
          {isDoubles && <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, color: '#374151' }}>Team Name</label>
            <input value={form.teamName} onChange={e => set('teamName', e.target.value)} style={{ width: '100%', padding: '11px 14px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 15 }} placeholder="e.g. Thunder Smashers" />
          </div>}
        </div>

        {/* Player 1 */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>👤 {isDoubles ? 'Player 1' : 'Player'} Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'Full Name *', key: 'player1Name', type: 'text', required: true },
              { label: 'Email *', key: 'player1Email', type: 'email', required: true },
              { label: 'Mobile *', key: 'player1Mobile', type: 'tel', required: true },
              { label: 'Coach Name', key: 'player1Coach', type: 'text' },
              { label: 'Academy / Arena', key: 'player1Arena', type: 'text' }
            ].map(f => (
              <div key={f.key} style={{ gridColumn: f.key === 'player1Name' ? 'span 2' : 'auto' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 5, fontSize: 13, color: '#374151' }}>{f.label}</label>
                <input type={f.type} required={f.required} value={form[f.key]} onChange={e => set(f.key, e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Player 2 (doubles) */}
        {isDoubles && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>👤 Player 2 Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Full Name *', key: 'player2Name', required: true },
                { label: 'Email *', key: 'player2Email', type: 'email', required: true },
                { label: 'Mobile *', key: 'player2Mobile', type: 'tel', required: true },
                { label: 'Coach Name', key: 'player2Coach' },
                { label: 'Academy / Arena', key: 'player2Arena' }
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.key === 'player2Name' ? 'span 2' : 'auto' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 5, fontSize: 13, color: '#374151' }}>{f.label}</label>
                  <input type={f.type || 'text'} required={f.required} value={form[f.key]} onChange={e => set(f.key, e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment */}
        {tournament.requirePayment && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 4, color: '#1e293b' }}>💰 Payment</h3>
            {tournament.paymentDetails && <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, whiteSpace: 'pre-wrap', color: '#854d0e' }}>{tournament.paymentDetails}</div>}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 5, fontSize: 13, color: '#374151' }}>Amount Paid (₹) *</label>
              <input type="number" required value={form.paymentAmount} onChange={e => set('paymentAmount', e.target.value)} min="0" style={{ width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} placeholder={tournament.entryFee} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 5, fontSize: 13, color: '#374151' }}>Upload Payment Screenshot *</label>
              <input type="file" accept="image/*,.pdf" required onChange={e => setFile(e.target.files[0])} style={{ fontSize: 14, color: '#64748b' }} />
            </div>
          </div>
        )}

        <button type="submit" disabled={submitting} style={{ width: '100%', padding: 16, background: submitting ? '#94a3b8' : '#1e3a5f', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 17, cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting ? '⏳ Submitting...' : '🏸 Submit Registration'}
        </button>
      </form>
    </div>
  );
}
