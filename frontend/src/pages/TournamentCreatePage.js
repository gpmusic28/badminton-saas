import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const C = { bg:'#04080f',surface:'#0b1220',elevated:'#111c2e',border:'rgba(255,255,255,0.07)',brand:'#00d4ff',green:'#00e676',red:'#ff1744',amber:'#ffab00',text:'#f1f5f9',sub:'#64748b',muted:'#2d3f55' };
const sans = "'DM Sans','Segoe UI',system-ui,sans-serif";
// const font = "'DM Mono','Fira Code',monospace";

const Input = ({ label, help, ...props }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', color: C.sub, fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>{label}</label>
    <input {...props} style={{ width: '100%', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', color: C.text, fontSize: 14, outline: 'none', fontFamily: sans, boxSizing: 'border-box' }} />
    {help && <p style={{ color: C.muted, fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>{help}</p>}
  </div>
);

const Select = ({ label, help, children, ...props }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', color: C.sub, fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>{label}</label>
    <select {...props} style={{ width: '100%', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', color: C.text, fontSize: 14, outline: 'none', fontFamily: sans, cursor: 'pointer', boxSizing: 'border-box' }}>
      {children}
    </select>
    {help && <p style={{ color: C.muted, fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>{help}</p>}
  </div>
);

const Checkbox = ({ label, help, ...props }) => (
  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, cursor: 'pointer' }}>
    <input type="checkbox" {...props} style={{ marginTop: 3, width: 16, height: 16, accentColor: C.brand, cursor: 'pointer' }} />
    <div>
      <span style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{label}</span>
      {help && <p style={{ color: C.muted, fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>{help}</p>}
    </div>
  </label>
);

const RuleCard = ({ icon, title, children }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <h4 style={{ color: C.text, fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h4>
    </div>
    {children}
  </div>
);

export default function TournamentCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=basic, 2=categories, 3=settings
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', venue: '', startDate: '', endDate: '', organizerName: '', contactEmail: '', contactPhone: '', description: '',
    requirePayment: false, entryFee: 0, paymentDetails: '',
  });

  const [categories, setCategories] = useState([{
    name: 'Men Singles', type: 'singles', gender: 'men', ageGroup: 'open',
    rules: {
      format: 'knockout',
      knockout: { singleElimination: true, doubleElimination: false, thirdPlaceMatch: false },
      roundRobin: { groupCount: 2, teamsAdvancePerGroup: 2, pointsForWin: 2, pointsForLoss: 0 },
      bestOf: 3, pointsPerSet: 21,
      deuce: true, deuceType: 'standard', goldenPoint: true, maxCap: 30, pointAdvantage: 2,
      rallyPoint: true, serveSideSwitch: true, midSetSwitch: true, midSetSwitchPoint: 11,
      timeoutsPerSet: 0, timeoutDurationSec: 60, setBreakDurationSec: 120,
      allowWalkover: true, tiebreaker: ['head_to_head', 'set_difference'],
    },
  }]);

  const [activeCatIdx, setActiveCatIdx] = useState(0);

  const updateCat = (idx, field, value) => {
    const updated = [...categories];
    const keys = field.split('.');
    if (keys.length === 1) {
      updated[idx][field] = value;
    } else if (keys.length === 2) {
      updated[idx][keys[0]][keys[1]] = value;
    } else if (keys.length === 3) {
      updated[idx][keys[0]][keys[1]][keys[2]] = value;
    }
    setCategories(updated);
  };

  const addCategory = () => {
    setCategories([...categories, { ...categories[0], name: `Category ${categories.length + 1}` }]);
  };

  const removeCategory = (idx) => {
    if (categories.length === 1) return;
    setCategories(categories.filter((_, i) => i !== idx));
    setActiveCatIdx(Math.max(0, activeCatIdx - 1));
  };

  const duplicateCategory = (idx) => {
    const dup = JSON.parse(JSON.stringify(categories[idx]));
    dup.name = `${dup.name} (Copy)`;
    setCategories([...categories, dup]);
  };

  const createTournament = async () => {
    setLoading(true); setError('');
    try {
      const res = await API.post('/tournaments', { ...form, categories });
      navigate(`/tournaments/${res.data.tournament._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create tournament');
    }
    setLoading(false);
  };

  const cat = categories[activeCatIdx];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: sans, color: C.text, padding: '0 0 60px' }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .tab-cat:hover{border-color:rgba(0,212,255,0.5)!important}
        .cat-btn:hover{opacity:0.8}
      `}</style>

      {/* HEADER */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', fontSize: 13, fontFamily: sans, padding: 0 }}>← Dashboard</button>
            <span style={{ color: C.muted }}>›</span>
            <h1 style={{ color: C.text, fontWeight: 700, fontSize: 16, margin: 0 }}>Create Tournament</h1>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3].map(s => (
              <div key={s} onClick={() => setStep(s)} style={{ width: 32, height: 32, borderRadius: 8, background: step >= s ? C.brand : C.elevated, border: `1px solid ${step >= s ? C.brand + '60' : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: step >= s ? C.bg : C.sub, transition: 'all 0.2s' }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {error && (
          <div style={{ background: 'rgba(255,23,68,0.1)', border: `1px solid ${C.red}40`, color: '#ffa0b0', padding: '12px 18px', borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 600, animation: 'fadeIn 0.3s ease' }}>
            ⚠ {error}
          </div>
        )}

        {/* STEP 1: BASIC INFO */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>Basic Tournament Information</h2>
            <p style={{ color: C.sub, marginBottom: 28, fontSize: 14 }}>Essential details about your tournament</p>

            <div style={{ background: C.surface, borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
              <Input label="Tournament Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Summer Badminton Championship 2024" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input label="Venue *" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="City Sports Complex" />
                <Input label="Organizer Name" value={form.organizerName} onChange={e => setForm({ ...form, organizerName: e.target.value })} placeholder="John Smith" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input label="Start Date *" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                <Input label="End Date *" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input label="Contact Email" type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="organizer@example.com" />
                <Input label="Contact Phone" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="+91 98765 43210" />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: C.sub, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Description (Optional)</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Tournament details, rules, prizes..." style={{ width: '100%', minHeight: 80, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', color: C.text, fontSize: 14, outline: 'none', fontFamily: sans, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>

              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginTop: 8 }}>
                <Checkbox label="Require Entry Fee Payment" checked={form.requirePayment} onChange={e => setForm({ ...form, requirePayment: e.target.checked })} help="Players must pay to register" />
                {form.requirePayment && (
                  <>
                    <Input label="Entry Fee (₹)" type="number" value={form.entryFee} onChange={e => setForm({ ...form, entryFee: Number(e.target.value) })} placeholder="500" />
                    <div style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', color: C.sub, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Payment Instructions</label>
                      <textarea value={form.paymentDetails} onChange={e => setForm({ ...form, paymentDetails: e.target.value })} placeholder="UPI: organizer@upi&#10;Bank: ABC Bank, Acc: 1234567890&#10;Upload screenshot after payment" style={{ width: '100%', minHeight: 80, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', color: C.text, fontSize: 14, outline: 'none', fontFamily: sans, resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                  </>
                )}
              </div>
            </div>

            <button onClick={() => setStep(2)} disabled={!form.name || !form.venue || !form.startDate || !form.endDate} style={{ marginTop: 24, padding: '14px 32px', background: (!form.name || !form.venue) ? C.muted : C.brand, color: C.bg, border: 'none', borderRadius: 10, cursor: (!form.name || !form.venue) ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 15, fontFamily: sans, width: '100%' }}>
              Next: Configure Categories →
            </button>
          </div>
        )}

        {/* STEP 2: CATEGORIES & RULES */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>Categories & Match Rules</h2>
            <p style={{ color: C.sub, marginBottom: 20, fontSize: 14 }}>Customize every aspect of scoring for each category</p>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {categories.map((c, i) => (
                <button key={i} className="tab-cat" onClick={() => setActiveCatIdx(i)} style={{ padding: '10px 16px', background: i === activeCatIdx ? C.brandDim : C.surface, border: `1px solid ${i === activeCatIdx ? C.brand + '60' : C.border}`, borderRadius: 10, cursor: 'pointer', color: i === activeCatIdx ? C.brand : C.text, fontWeight: i === activeCatIdx ? 700 : 500, fontSize: 13, fontFamily: sans, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {c.name}
                  {categories.length > 1 && <span onClick={e => { e.stopPropagation(); removeCategory(i); }} style={{ color: C.red, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</span>}
                </button>
              ))}
              <button className="cat-btn" onClick={addCategory} style={{ padding: '10px 16px', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, cursor: 'pointer', color: C.brand, fontWeight: 700, fontSize: 13, fontFamily: sans, transition: 'all 0.2s' }}>
                + Add Category
              </button>
            </div>

            <div style={{ background: C.surface, borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>{cat.name}</h3>
                <button className="cat-btn" onClick={() => duplicateCategory(activeCatIdx)} style={{ padding: '8px 14px', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', color: C.sub, fontWeight: 600, fontSize: 12, fontFamily: sans }}>
                  Duplicate
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <Input label="Category Name" value={cat.name} onChange={e => updateCat(activeCatIdx, 'name', e.target.value)} placeholder="Men Singles" />
                <Select label="Type" value={cat.type} onChange={e => updateCat(activeCatIdx, 'type', e.target.value)}>
                  <option value="singles">Singles</option>
                  <option value="doubles">Doubles</option>
                  <option value="mixed">Mixed Doubles</option>
                </Select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Select label="Gender" value={cat.gender} onChange={e => updateCat(activeCatIdx, 'gender', e.target.value)}>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="mixed">Mixed</option>
                </Select>
                <Select label="Age Group" value={cat.ageGroup} onChange={e => updateCat(activeCatIdx, 'ageGroup', e.target.value)}>
                  <option value="open">Open</option>
                  <option value="u15">Under 15</option>
                  <option value="u17">Under 17</option>
                  <option value="u19">Under 19</option>
                  <option value="senior">Senior (35+)</option>
                </Select>
              </div>
            </div>

            {/* SCORING RULES */}
            <RuleCard icon="🏸" title="Match Format & Scoring">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Select label="Format" value={cat.rules.format} onChange={e => updateCat(activeCatIdx, 'rules.format', e.target.value)} help="Tournament structure">
                  <option value="knockout">Knockout</option>
                  <option value="round_robin">Round Robin</option>
                  <option value="group_knockout">Group + Knockout</option>
                </Select>
                <Select label="Best Of" value={cat.rules.bestOf} onChange={e => updateCat(activeCatIdx, 'rules.bestOf', Number(e.target.value))} help="Sets to win match">
                  <option value="1">Best of 1</option>
                  <option value="3">Best of 3</option>
                  <option value="5">Best of 5</option>
                </Select>
                <Select label="Points Per Set" value={cat.rules.pointsPerSet} onChange={e => updateCat(activeCatIdx, 'rules.pointsPerSet', Number(e.target.value))} help="Points needed to win set">
                  <option value="11">11 Points</option>
                  <option value="15">15 Points</option>
                  <option value="21">21 Points (BWF)</option>
                  <option value="25">25 Points</option>
                  <option value="30">30 Points</option>
                </Select>
              </div>

              {cat.rules.format === 'knockout' && (
                <div style={{ marginTop: 16, padding: 16, background: C.elevated, borderRadius: 10 }}>
                  <p style={{ color: C.sub, fontSize: 12, marginBottom: 12, fontWeight: 600 }}>Knockout Options</p>
                  <Checkbox label="Single Elimination" checked={cat.rules.knockout.singleElimination} onChange={e => updateCat(activeCatIdx, 'rules.knockout.singleElimination', e.target.checked)} help="Standard knockout — lose once, you're out" />
                  <Checkbox label="Double Elimination" checked={cat.rules.knockout.doubleElimination} onChange={e => updateCat(activeCatIdx, 'rules.knockout.doubleElimination', e.target.checked)} help="Losers bracket — second chance" />
                  <Checkbox label="3rd Place Match" checked={cat.rules.knockout.thirdPlaceMatch} onChange={e => updateCat(activeCatIdx, 'rules.knockout.thirdPlaceMatch', e.target.checked)} help="Semifinal losers play for bronze" />
                </div>
              )}

              {(cat.rules.format === 'round_robin' || cat.rules.format === 'group_knockout') && (
                <div style={{ marginTop: 16, padding: 16, background: C.elevated, borderRadius: 10 }}>
                  <p style={{ color: C.sub, fontSize: 12, marginBottom: 12, fontWeight: 600 }}>Round Robin Settings</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <Select label="Groups" value={cat.rules.roundRobin.groupCount} onChange={e => updateCat(activeCatIdx, 'rules.roundRobin.groupCount', Number(e.target.value))}>
                      {[2, 4, 8].map(n => <option key={n} value={n}>{n} Groups</option>)}
                    </Select>
                    <Select label="Teams Advance" value={cat.rules.roundRobin.teamsAdvancePerGroup} onChange={e => updateCat(activeCatIdx, 'rules.roundRobin.teamsAdvancePerGroup', Number(e.target.value))}>
                      {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} per group</option>)}
                    </Select>
                    <Input label="Points for Win" type="number" value={cat.rules.roundRobin.pointsForWin} onChange={e => updateCat(activeCatIdx, 'rules.roundRobin.pointsForWin', Number(e.target.value))} />
                  </div>
                </div>
              )}
            </RuleCard>

            {/* DEUCE RULES */}
            <RuleCard icon="⚡" title="Deuce & Point Cap">
              <Checkbox label="Enable Deuce" checked={cat.rules.deuce} onChange={e => updateCat(activeCatIdx, 'rules.deuce', e.target.checked)} help="Require 2-point advantage after reaching set point" />

              {cat.rules.deuce && (
                <>
                  <Select label="Deuce Type" value={cat.rules.deuceType} onChange={e => updateCat(activeCatIdx, 'rules.deuceType', e.target.value)} help="How deuce is resolved">
                    <option value="standard">Standard (2-point advantage)</option>
                    <option value="golden_point">Golden Point (sudden death)</option>
                    <option value="cap">Hard Cap (no advantage)</option>
                  </Select>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                    <Input label="Points Advantage" type="number" value={cat.rules.pointAdvantage} onChange={e => updateCat(activeCatIdx, 'rules.pointAdvantage', Number(e.target.value))} help="Gap needed to win (usually 2)" />
                    <Input label="Max Cap" type="number" value={cat.rules.maxCap} onChange={e => updateCat(activeCatIdx, 'rules.maxCap', Number(e.target.value))} help="Absolute max points (BWF: 30)" />
                  </div>

                  <Checkbox label="Golden Point at 29-29" checked={cat.rules.goldenPoint} onChange={e => updateCat(activeCatIdx, 'rules.goldenPoint', e.target.checked)} help="Next point wins at 29-all (BWF regulation)" />
                </>
              )}
            </RuleCard>

            {/* SERVICE & SIDES */}
            <RuleCard icon="🔄" title="Service & Court Sides">
              <Checkbox label="Rally Point Scoring" checked={cat.rules.rallyPoint} onChange={e => updateCat(activeCatIdx, 'rules.rallyPoint', e.target.checked)} help="Point on every rally (BWF standard). Unchecked = traditional (point only on serve)" />
              <Checkbox label="Switch Sides After Each Set" checked={cat.rules.serveSideSwitch} onChange={e => updateCat(activeCatIdx, 'rules.serveSideSwitch', e.target.checked)} help="Teams switch ends between sets" />
              <Checkbox label="Mid-Set Switch (3rd Set)" checked={cat.rules.midSetSwitch} onChange={e => updateCat(activeCatIdx, 'rules.midSetSwitch', e.target.checked)} help="Switch sides at midpoint in deciding set" />

              {cat.rules.midSetSwitch && (
                <Input label="Mid-Set Switch Point" type="number" value={cat.rules.midSetSwitchPoint} onChange={e => updateCat(activeCatIdx, 'rules.midSetSwitchPoint', Number(e.target.value))} help="Point at which to switch (BWF: 11)" />
              )}
            </RuleCard>

            {/* TIMEOUTS & INTERVALS */}
            <RuleCard icon="⏱" title="Timeouts & Breaks">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input label="Timeouts Per Set" type="number" value={cat.rules.timeoutsPerSet} onChange={e => updateCat(activeCatIdx, 'rules.timeoutsPerSet', Number(e.target.value))} help="0 = no timeouts" />
                <Input label="Timeout Duration (sec)" type="number" value={cat.rules.timeoutDurationSec} onChange={e => updateCat(activeCatIdx, 'rules.timeoutDurationSec', Number(e.target.value))} help="Usually 60 seconds" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                <Input label="Set Break Duration (sec)" type="number" value={cat.rules.setBreakDurationSec} onChange={e => updateCat(activeCatIdx, 'rules.setBreakDurationSec', Number(e.target.value))} help="Rest between sets (BWF: 120s)" />
                <Input label="Match Break (sec)" type="number" value={cat.rules.matchBreakDurationSec} onChange={e => updateCat(activeCatIdx, 'rules.matchBreakDurationSec', Number(e.target.value))} help="Rest before 3rd set (optional)" />
              </div>
            </RuleCard>

            {/* WALKOVER */}
            <RuleCard icon="🚫" title="Walkover & Forfeit">
              <Checkbox label="Allow Walkover" checked={cat.rules.allowWalkover} onChange={e => updateCat(activeCatIdx, 'rules.allowWalkover', e.target.checked)} help="Teams can forfeit — opponent advances" />
            </RuleCard>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', background: C.elevated, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: sans }}>
                ← Previous
              </button>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', background: C.brand, color: C.bg, border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 800, fontSize: 14, fontFamily: sans }}>
                Next: Finalize →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & CREATE */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>Review & Create</h2>
            <p style={{ color: C.sub, marginBottom: 28, fontSize: 14 }}>Final check before creating your tournament</p>

            <div style={{ background: C.surface, borderRadius: 16, padding: 28, border: `1px solid ${C.border}`, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Tournament Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px 20px', fontSize: 14 }}>
                {[
                  ['Name', form.name],
                  ['Venue', form.venue],
                  ['Dates', `${new Date(form.startDate).toLocaleDateString('en-IN')} — ${new Date(form.endDate).toLocaleDateString('en-IN')}`],
                  ['Organizer', form.organizerName || '—'],
                  ['Contact', form.contactEmail || form.contactPhone || '—'],
                  ['Entry Fee', form.requirePayment ? `₹${form.entryFee}` : 'FREE'],
                  ['Categories', categories.length],
                ].map(([k, v]) => (
                  <React.Fragment key={k}>
                    <span style={{ color: C.sub }}>{k}</span>
                    <span style={{ color: C.text, fontWeight: 600 }}>{v}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div style={{ background: C.surface, borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Categories ({categories.length})</h3>
              {categories.map((c, i) => (
                <div key={i} style={{ background: C.elevated, borderRadius: 10, padding: 16, marginBottom: 10, border: `1px solid ${C.border}` }}>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 15, marginBottom: 8 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: C.sub, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>{c.type} · {c.gender} · {c.ageGroup}</span>
                    <span>Best of {c.rules.bestOf} · {c.rules.pointsPerSet} pts</span>
                    <span>{c.rules.format}</span>
                    <span>{c.rules.deuce ? `Deuce (${c.rules.deuceType})` : 'No deuce'}</span>
                    {c.rules.goldenPoint && <span>Golden Point</span>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '14px', background: C.elevated, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: sans }}>
                ← Previous
              </button>
              <button onClick={createTournament} disabled={loading} style={{ flex: 1, padding: '16px', background: loading ? C.muted : C.green, color: '#fff', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 15, fontFamily: sans, boxShadow: loading ? 'none' : `0 0 20px ${C.green}40` }}>
                {loading ? '⏳ Creating...' : '🏆 Create Tournament'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
