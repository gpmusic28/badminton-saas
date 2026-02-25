import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';

const statusColor = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' };

export default function RegistrationsPage() {
  const { id } = useParams();
  const [data, setData] = useState({ registrations: [], counts: {} });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [bulkModal, setBulkModal] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkCat, setBulkCat] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [manualForm, setManualForm] = useState({ tournament: id, categoryName: '', teamName: '', player1: { name: '', email: '', mobile: '', coach: '', arena: '' }, status: 'approved', entryMode: 'manual' });
  const [notes] = useState('');
  const fileRef = useRef();

  const load = async () => {
    const q = filter !== 'all' ? `?status=${filter}` : '';
    const res = await API.get(`/registrations/tournament/${id}${q}`);
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    load();
    API.get(`/tournaments/my`).then(r => {
      const t = r.data.find(x => x._id === id);
      if (t) setCategories(t.categories || []);
    });
  }, [id, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const approve = async (regId) => {
    await API.put(`/registrations/${regId}/approve`, { notes });
    load();
  };

  const reject = async (regId) => {
    await API.put(`/registrations/${regId}/reject`, { notes });
    load();
  };

  const bulkUpload = async () => {
    if (!bulkFile || !bulkCat) return alert('Please select file and category');
    setBulkLoading(true);
    const fd = new FormData();
    fd.append('file', bulkFile);
    fd.append('tournamentId', id);
    fd.append('categoryName', bulkCat);
    try {
      const res = await API.post('/registrations/bulk', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setBulkResult(res.data);
      load();
    } catch (err) { alert(err.response?.data?.error || 'Upload failed'); }
    setBulkLoading(false);
  };

  const addManual = async () => {
    try {
      await API.post('/registrations/manual', manualForm);
      setManualModal(false);
      load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const del = async (regId) => {
    if (!window.confirm('Delete this registration?')) return;
    await API.delete(`/registrations/${regId}`);
    load();
  };

  const tabs = [
    { key: 'all', label: `All (${data.counts.total || 0})` },
    { key: 'pending', label: `Pending (${data.counts.pending || 0})` },
    { key: 'approved', label: `Approved (${data.counts.approved || 0})` },
    { key: 'rejected', label: `Rejected (${data.counts.rejected || 0})` }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>Registrations</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setManualModal(true)} style={{ padding: '9px 16px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Add Manually</button>
          <button onClick={() => setBulkModal(true)} style={{ padding: '9px 16px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>📤 Bulk Upload</button>
          <a href={`data:text/csv;charset=utf-8,Team Name,Player1 Name,Player1 Email,Player1 Mobile,Player2 Name,Player2 Email,Player2 Mobile,Coach,Arena,Payment Status\nTeam Alpha,John Doe,john@email.com,9876543210,,,,,Coach X,Arena 1,Paid`} download="bulk_upload_template.csv" style={{ padding: '9px 16px', background: '#fefce8', color: '#854d0e', border: '1px solid #fef08a', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
            ⬇ Template
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{ padding: '8px 16px', background: filter === t.key ? '#fff' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: filter === t.key ? '#1e293b' : '#64748b', boxShadow: filter === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}>Loading...</div> :
        data.registrations.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', background: '#fff', borderRadius: 16, border: '2px dashed #e2e8f0' }}>No registrations found</div> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.registrations.map(reg => (
            <div key={reg._id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>{reg.teamName || reg.player1?.name}</span>
                    <span style={{ background: statusColor[reg.status] + '20', color: statusColor[reg.status], fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>{reg.status.toUpperCase()}</span>
                    <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{reg.categoryName}</span>
                    <span style={{ background: '#f1f5f9', color: '#94a3b8', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{reg.entryMode}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>👤 {reg.player1?.name} • {reg.player1?.email} • {reg.player1?.mobile}</span>
                    {reg.player1?.coach && <span style={{ fontSize: 13, color: '#64748b' }}>🏋️ {reg.player1.coach}</span>}
                    {reg.player1?.arena && <span style={{ fontSize: 13, color: '#64748b' }}>🏟️ {reg.player1.arena}</span>}
                  </div>
                  {reg.player2?.name && <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>👤 P2: {reg.player2.name} • {reg.player2.email} • {reg.player2.mobile}</div>}
                  {reg.paymentAmount && <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>💰 ₹{reg.paymentAmount} — <span style={{ color: statusColor[reg.paymentStatus] || '#64748b', fontWeight: 600 }}>{reg.paymentStatus}</span></div>}
                  {reg.reviewNotes && <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>📝 {reg.reviewNotes}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {reg.paymentScreenshot && <button onClick={() => setPreview(`http://localhost:3001${reg.paymentScreenshot}`)} style={{ padding: '7px 12px', background: '#fefce8', color: '#854d0e', border: '1px solid #fef08a', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>💳 Payment</button>}
                  {reg.status === 'pending' && <>
                    <button onClick={() => approve(reg._id)} style={{ padding: '7px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>✓ Approve</button>
                    <button onClick={() => reject(reg._id)} style={{ padding: '7px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>✗ Reject</button>
                  </>}
                  <button onClick={() => del(reg._id)} style={{ padding: '7px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      }

      {/* Payment Screenshot Preview */}
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 16, maxWidth: 500, width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontWeight: 700 }}>Payment Screenshot</h3>
              <button onClick={() => setPreview(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <img src={preview} alt="Payment" style={{ width: '100%', borderRadius: 8 }} />
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {bulkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 460, width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>📤 Bulk Upload Teams</h3>
              <button onClick={() => { setBulkModal(false); setBulkResult(null); }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            {!bulkResult ? <>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 14, marginBottom: 20, fontSize: 13, color: '#1e40af' }}>
                📋 Excel columns: Team Name, Player1 Name, Player1 Email, Player1 Mobile, Player2 Name (optional), Coach, Arena, Payment Status (Paid/Unpaid)
              </div>
              <select value={bulkCat} onChange={e => setBulkCat(e.target.value)} style={{ width: '100%', padding: '11px 14px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
              <input type="file" accept=".xlsx,.xls,.csv" ref={fileRef} onChange={e => setBulkFile(e.target.files[0])} style={{ marginBottom: 20, fontSize: 14 }} />
              <button onClick={bulkUpload} disabled={bulkLoading} style={{ width: '100%', padding: 14, background: bulkLoading ? '#94a3b8' : '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: bulkLoading ? 'not-allowed' : 'pointer' }}>
                {bulkLoading ? 'Uploading...' : 'Upload Teams'}
              </button>
            </> : (
              <div>
                <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <strong>✅ {bulkResult.success} teams imported successfully!</strong>
                  {bulkResult.failed > 0 && <div style={{ color: '#ef4444', marginTop: 8 }}>❌ {bulkResult.failed} failed</div>}
                </div>
                {bulkResult.errors?.length > 0 && <div style={{ fontSize: 12, color: '#64748b' }}>{bulkResult.errors.join('\n')}</div>}
                <button onClick={() => { setBulkModal(false); setBulkResult(null); }} style={{ width: '100%', padding: 12, background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: 16 }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {manualModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 480, width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>➕ Add Team Manually</h3>
              <button onClick={() => setManualModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            {[
              { label: 'Category', key: 'categoryName', el: 'select' },
              { label: 'Team Name', key: 'teamName', type: 'text' },
              { label: 'Player 1 Name *', key: 'p1name', type: 'text' },
              { label: 'Player 1 Email *', key: 'p1email', type: 'email' },
              { label: 'Player 1 Mobile *', key: 'p1mobile', type: 'tel' },
              { label: 'Coach', key: 'p1coach', type: 'text' },
              { label: 'Arena', key: 'p1arena', type: 'text' }
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 5, fontSize: 13, color: '#374151' }}>{f.label}</label>
                {f.el === 'select' ? (
                  <select value={manualForm.categoryName} onChange={e => setManualForm(m => ({ ...m, categoryName: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                ) : (
                  <input type={f.type} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
                    value={f.key === 'teamName' ? manualForm.teamName : manualForm.player1[f.key.replace('p1','')]}
                    onChange={e => {
                      if (f.key === 'teamName') setManualForm(m => ({ ...m, teamName: e.target.value }));
                      else setManualForm(m => ({ ...m, player1: { ...m.player1, [f.key.replace('p1','')]: e.target.value } }));
                    }} />
                )}
              </div>
            ))}
            <button onClick={addManual} style={{ width: '100%', padding: 14, background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>Add Team</button>
          </div>
        </div>
      )}
    </div>
  );
}
