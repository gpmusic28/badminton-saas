import React, { useState, useEffect } from 'react';
import API from '../api';

const C = { bg:'#04080f',surface:'#0b1220',elevated:'#111c2e',border:'rgba(255,255,255,0.07)',brand:'#00d4ff',green:'#00e676',red:'#ff1744',amber:'#ffab00',text:'#f1f5f9',sub:'#64748b',muted:'#2d3f55' };
const sans = "'DM Sans','Segoe UI',system-ui,sans-serif";

export default function TeamManagementPage() {
  const [users, setUsers] = useState([]);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'staff' });
  const [msg, setMsg] = useState({ text: '', ok: true });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [u, o] = await Promise.all([API.get('/organizations/users'), API.get('/organizations/my')]);
      setUsers(u.data.users);
      setOrg(o.data);
    } catch {}
    setLoading(false);
  };

  const invite = async () => {
    try {
      const res = await API.post('/organizations/users/invite', inviteForm);
      setMsg({ text: `✅ ${inviteForm.email} invited! Temp password: ${res.data.temporaryPassword}`, ok: true });
      setInviteForm({ email: '', name: '', role: 'staff' });
      setShowInvite(false);
      load();
    } catch (err) {
      setMsg({ text: '❌ ' + (err.response?.data?.error || 'Failed'), ok: false });
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      await API.put(`/organizations/users/${userId}`, { role: newRole });
      setMsg({ text: '✅ Role updated', ok: true });
      load();
    } catch (err) {
      setMsg({ text: '❌ ' + (err.response?.data?.error || 'Failed'), ok: false });
    }
  };

  const toggleActive = async (userId, isActive) => {
    try {
      await API.put(`/organizations/users/${userId}`, { isActive: !isActive });
      setMsg({ text: isActive ? '✅ User deactivated' : '✅ User activated', ok: true });
      load();
    } catch (err) {
      setMsg({ text: '❌ ' + (err.response?.data?.error || 'Failed'), ok: false });
    }
  };

  const removeUser = async (userId) => {
    if (!window.confirm('Remove this user from organization?')) return;
    try {
      await API.delete(`/organizations/users/${userId}`);
      setMsg({ text: '✅ User removed', ok: true });
      load();
    } catch (err) {
      setMsg({ text: '❌ ' + (err.response?.data?.error || 'Failed'), ok: false });
    }
  };

  const roleColors = {
    super_admin: C.red,
    org_admin: C.brand,
    organizer: C.green,
    umpire: C.amber,
    staff: C.sub,
    player: C.muted,
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: sans, color: C.text }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: sans, color: C.text, padding: '0 0 60px' }}>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>Team & Permissions</h1>
            <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>{org?.name} · {users.length} / {org?.limits.totalUsers} users</p>
          </div>
          <button onClick={() => setShowInvite(true)} disabled={users.length >= org?.limits.totalUsers} style={{ padding: '10px 20px', background: users.length >= org?.limits.totalUsers ? C.muted : C.brand, color: C.bg, border: 'none', borderRadius: 10, cursor: users.length >= org?.limits.totalUsers ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, fontFamily: sans }}>
            + Invite User
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        {msg.text && (
          <div style={{ background: msg.ok ? 'rgba(0,230,118,0.1)' : 'rgba(255,23,68,0.1)', border: `1px solid ${msg.ok ? C.green + '40' : C.red + '40'}`, color: msg.ok ? C.green : '#ffa0b0', padding: '12px 18px', borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
            {msg.text}
          </div>
        )}

        {/* Role legend */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Roles & Permissions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {[
              { role: 'org_admin', label: 'Organization Admin', desc: 'Full access — invite users, manage billing, all tournaments' },
              { role: 'organizer', label: 'Organizer', desc: 'Create tournaments, manage registrations, generate brackets' },
              { role: 'staff', label: 'Staff', desc: 'View tournaments, approve registrations, schedule matches' },
              { role: 'umpire', label: 'Umpire', desc: 'Score matches live, edit match results' },
            ].map(r => (
              <div key={r.role} style={{ background: C.elevated, borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: roleColors[r.role] }} />
                  <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{r.label}</span>
                </div>
                <p style={{ color: C.sub, fontSize: 11, margin: 0, lineHeight: 1.4 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Users table */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.elevated, borderBottom: `1px solid ${C.border}` }}>
                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: C.sub, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '14px 16px', color: C.text, fontSize: 14, fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '14px 16px', color: C.sub, fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <select value={u.role} onChange={e => updateRole(u._id, e.target.value)} disabled={u.role === 'super_admin'} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 10px', color: roleColors[u.role], fontSize: 12, fontWeight: 700, outline: 'none', cursor: u.role === 'super_admin' ? 'not-allowed' : 'pointer', fontFamily: sans }}>
                      {Object.entries({ org_admin: 'Org Admin', organizer: 'Organizer', staff: 'Staff', umpire: 'Umpire', player: 'Player' }).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: u.isActive ? 'rgba(0,230,118,0.1)' : 'rgba(255,171,0,0.1)', color: u.isActive ? C.green : C.amber, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
                      {u.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: C.sub, fontSize: 12 }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => toggleActive(u._id, u.isActive)} style={{ padding: '6px 12px', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', color: C.sub, fontSize: 11, fontWeight: 600, fontFamily: sans }}>
                        {u.isActive ? 'Disable' : 'Enable'}
                      </button>
                      {u._id !== org?.owner && (
                        <button onClick={() => removeUser(u._id)} style={{ padding: '6px 12px', background: 'rgba(255,23,68,0.1)', border: `1px solid ${C.red}40`, borderRadius: 6, cursor: 'pointer', color: C.red, fontSize: 11, fontWeight: 600, fontFamily: sans }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }} onClick={() => setShowInvite(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 16, padding: 32, maxWidth: 500, width: '100%', border: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Invite Team Member</h2>
            <p style={{ color: C.sub, fontSize: 13, marginBottom: 24 }}>Send an invitation to join your organization</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: C.sub, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Email Address *</label>
              <input value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="user@example.com" style={{ width: '100%', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', color: C.text, fontSize: 14, outline: 'none', fontFamily: sans, boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: C.sub, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Full Name *</label>
              <input value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} placeholder="John Smith" style={{ width: '100%', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', color: C.text, fontSize: 14, outline: 'none', fontFamily: sans, boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: C.sub, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Role</label>
              <select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })} style={{ width: '100%', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', color: C.text, fontSize: 14, outline: 'none', fontFamily: sans, cursor: 'pointer', boxSizing: 'border-box' }}>
                <option value="staff">Staff</option>
                <option value="organizer">Organizer</option>
                <option value="umpire">Umpire</option>
                <option value="org_admin">Organization Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowInvite(false)} style={{ flex: 1, padding: '12px', background: C.elevated, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: sans }}>
                Cancel
              </button>
              <button onClick={invite} disabled={!inviteForm.email || !inviteForm.name} style={{ flex: 1, padding: '12px', background: (!inviteForm.email || !inviteForm.name) ? C.muted : C.brand, color: C.bg, border: 'none', borderRadius: 10, cursor: (!inviteForm.email || !inviteForm.name) ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 14, fontFamily: sans }}>
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
