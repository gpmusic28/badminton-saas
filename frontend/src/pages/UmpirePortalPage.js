import React, { useState, useEffect, useCallback, useRef } from 'react';
import API from '../api';

/* ══════════════════════════════════════════════════════════
   DESIGN SYSTEM
══════════════════════════════════════════════════════════ */
const C = {
  bg: '#04080f', surface: '#0b1220', elevated: '#111c2e',
  border: 'rgba(255,255,255,0.06)', borderHover: 'rgba(255,255,255,0.12)',
  brand: '#00d4ff', brandDim: 'rgba(0,212,255,0.12)',
  green: '#00e676', greenDim: 'rgba(0,230,118,0.12)',
  red: '#ff1744', redDim: 'rgba(255,23,68,0.12)',
  amber: '#ffab00', amberDim: 'rgba(255,171,0,0.12)',
  text: '#f1f5f9', textSub: '#64748b', textMuted: '#2d3f55',
  white: '#ffffff',
};

const font = "'DM Mono', 'Fira Code', 'Courier New', monospace";
const fontSans = "'DM Sans', 'Segoe UI', system-ui, sans-serif";

const glow = (color) => `0 0 20px ${color}40, 0 0 40px ${color}20`;

const styles = {
  fullPage: { minHeight: '100vh', background: C.bg, fontFamily: fontSans, color: C.text },
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 },
  btn: (bg = C.brand, color = C.bg) => ({
    background: bg, color, border: 'none', borderRadius: 10, padding: '12px 24px',
    fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: fontSans,
    transition: 'all 0.15s', letterSpacing: 0.3,
  }),
  btnOutline: (color = C.brand) => ({
    background: 'transparent', color, border: `1px solid ${color}`, borderRadius: 10,
    padding: '11px 22px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
    fontFamily: fontSans, transition: 'all 0.15s',
  }),
  tag: (bg, color) => ({
    background: bg, color, fontSize: 10, fontWeight: 800, padding: '3px 10px',
    borderRadius: 20, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap',
  }),
  input: {
    width: '100%', background: C.elevated, border: `1px solid ${C.border}`,
    borderRadius: 12, color: C.text, fontFamily: font, outline: 'none', boxSizing: 'border-box',
  },
};

/* ══════════════════════════════════════════════════════════
   LOGIN SCREEN
══════════════════════════════════════════════════════════ */
function LoginScreen({ onSuccess }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef();

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

  const lookup = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) { setError('Code must be at least 4 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await API.post('/brackets/umpire/lookup', { code: trimmed });
      onSuccess(res.data, trimmed);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
      setShake(true); setTimeout(() => setShake(false), 600);
    }
    setLoading(false);
  };

  const digits = code.padEnd(6, ' ').split('');

  return (
    <div style={{ ...styles.fullPage, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      {/* Grid bg */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ width: 72, height: 72, background: C.brandDim, border: `2px solid ${C.brand}30`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px', boxShadow: glow(C.brand) }}>🏸</div>
          <h1 style={{ fontFamily: font, fontSize: 26, fontWeight: 900, color: C.white, margin: 0, letterSpacing: -1 }}>UMPIRE PORTAL</h1>
          <p style={{ color: C.textSub, marginTop: 6, fontSize: 13 }}>Professional Match Scoring System</p>
        </div>

        {/* Login card */}
        <div style={{ ...styles.card, padding: '36px 32px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', animation: shake ? 'shake 0.4s ease' : 'none' }}>
          <style>{`
            @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
            @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
            @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
            @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
          `}</style>

          <p style={{ color: C.textSub, fontSize: 13, marginBottom: 24, textAlign: 'center', lineHeight: 1.6 }}>
            Enter the <span style={{ color: C.brand, fontWeight: 700 }}>6-character code</span> provided by your tournament organizer
          </p>

          {/* Hidden real input */}
          <input
            ref={inputRef}
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            onKeyDown={e => e.key === 'Enter' && lookup()}
            style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
            maxLength={6}
          />

          {/* Visual code display */}
          <div onClick={() => inputRef.current?.focus()} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8, cursor: 'text' }}>
            {digits.map((d, i) => (
              <div key={i} style={{ width: 48, height: 60, background: d.trim() ? C.elevated : C.bg, border: `2px solid ${d.trim() ? C.brand : C.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontSize: 24, fontWeight: 900, color: C.white, transition: 'all 0.15s', boxShadow: d.trim() ? `0 0 12px ${C.brand}40` : 'none', position: 'relative' }}>
                {d.trim() || (i === code.length ? <span style={{ width: 2, height: 28, background: C.brand, display: 'block', animation: 'pulse 1s infinite' }} /> : '')}
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, color: '#ffa0b0', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 12, textAlign: 'center', animation: 'fadeIn 0.2s ease' }}>
              ⚠ {error}
            </div>
          )}

          <button onClick={lookup} disabled={loading || code.length < 4} style={{ ...styles.btn(code.length >= 4 && !loading ? C.brand : C.textMuted, C.bg), width: '100%', padding: '14px', fontSize: 15, marginTop: 16, boxShadow: code.length >= 4 && !loading ? glow(C.brand) : 'none' }}>
            {loading ? '🔍 Authenticating...' : 'ACCESS TOURNAMENT →'}
          </button>

          <div style={{ marginTop: 20, padding: 14, background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <p style={{ color: C.textMuted, fontSize: 11, margin: 0, textAlign: 'center', lineHeight: 1.8, fontFamily: font }}>
              📋 CODE IS ON TOURNAMENT MANAGE PAGE<br />
              💬 ORGANIZER SHARES VIA WHATSAPP/SMS<br />
              🏆 ONE CODE = FULL TOURNAMENT ACCESS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MATCH LIST
══════════════════════════════════════════════════════════ */
function MatchList({ data, onSelectMatch, onBack }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const counts = {
    all: data.matches.length,
    live: data.matches.filter(m => m.status === 'live' || m.status === 'toss').length,
    upcoming: data.matches.filter(m => m.status === 'pending' || m.status === 'scheduled').length,
    done: data.matches.filter(m => m.status === 'completed').length,
  };

  const filtered = data.matches.filter(m => {
    const byFilter = filter === 'all' ? true : filter === 'live' ? (m.status === 'live' || m.status === 'toss') : filter === 'done' ? m.status === 'completed' : (m.status === 'pending' || m.status === 'scheduled');
    const bySearch = !search || [m.team1?.name, m.team2?.name, m.categoryName].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return byFilter && bySearch;
  });

  const getStatusTag = (status) => {
    const map = {
      live: { bg: C.red, label: '● LIVE' },
      toss: { bg: C.amber, label: '⚡ TOSS' },
      scheduled: { bg: C.brand, label: '📅 SCHEDULED' },
      completed: { bg: C.textMuted, label: '✓ DONE' },
      pending: { bg: C.textMuted, label: '⏳ PENDING' },
    };
    return map[status] || map.pending;
  };

  return (
    <div style={{ ...styles.fullPage }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 20px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: font, fontSize: 10, color: C.brand, letterSpacing: 3, textTransform: 'uppercase' }}>UMPIRE PORTAL</span>
              <span style={{ fontFamily: font, background: C.brandDim, color: C.brand, fontSize: 10, padding: '2px 8px', borderRadius: 20, letterSpacing: 2, border: `1px solid ${C.brand}30` }}>{data.tournament.umpireAccessCode}</span>
            </div>
            <h2 style={{ color: C.white, fontWeight: 800, fontSize: 16, margin: '3px 0 0' }}>{data.tournament.name}</h2>
          </div>
          <button onClick={onBack} style={styles.btnOutline(C.textSub)}>⇄ Change Code</button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>
        {/* Live pulse */}
        {counts.live > 0 && (
          <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 12, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, background: C.red, borderRadius: '50%', boxShadow: glow(C.red) }} />
            <span style={{ color: '#ffb3be', fontWeight: 700, fontSize: 14 }}>{counts.live} match{counts.live > 1 ? 'es' : ''} active right now — tap to score</span>
          </div>
        )}

        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by team name or category..."
          style={{ ...styles.input, padding: '11px 16px', fontSize: 13, marginBottom: 10 }} />

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[['all', `All (${counts.all})`], ['live', `Live (${counts.live})`], ['upcoming', `Upcoming (${counts.upcoming})`], ['done', `Done (${counts.done})`]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ flex: 1, padding: '9px 4px', background: filter === k ? C.brandDim : 'transparent', color: filter === k ? C.brand : C.textSub, border: `1px solid ${filter === k ? C.brand + '60' : C.border}`, borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12, fontFamily: fontSans, transition: 'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Match cards */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textSub }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p>{counts.all === 0 ? 'Bracket not generated yet. Ask your organizer.' : 'No matches in this filter.'}</p>
          </div>
        ) : filtered.map(match => {
          const tag = getStatusTag(match.status);
          const t1Sets = match.scores?.filter(s => s.winner === 'team1').length || 0;
          const t2Sets = match.scores?.filter(s => s.winner === 'team2').length || 0;
          const isActive = match.status !== 'completed';
          return (
            <div key={match.id} onClick={() => isActive && onSelectMatch(match)}
              style={{ ...styles.card, padding: '18px 20px', marginBottom: 8, cursor: isActive ? 'pointer' : 'default', borderColor: match.status === 'live' ? `${C.red}40` : match.status === 'toss' ? `${C.amber}40` : C.border, background: match.status === 'live' ? `linear-gradient(135deg, ${C.redDim}, ${C.surface})` : C.surface, transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={styles.tag(tag.bg, '#fff')}>{tag.label}</span>
                  <span style={{ color: C.textSub, fontSize: 12 }}>{match.categoryName}</span>
                  <span style={{ color: C.textMuted, fontSize: 12 }}>{match.round} · M{match.matchNumber}</span>
                  {match.courtNumber && <span style={{ color: C.brand, fontSize: 12, fontWeight: 700, fontFamily: font }}>CT {match.courtNumber}</span>}
                </div>
                {isActive && <span style={{ color: C.brand, fontSize: 18 }}>›</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: match.winner?.id === match.team1?.id ? C.green : C.white, fontWeight: 700, fontSize: 15 }}>
                    {match.team1?.name || 'TBD'}
                    {match.server === 'team1' && match.status === 'live' && <span style={{ marginLeft: 6, color: C.green, fontSize: 11 }}>🏸</span>}
                  </div>
                  {match.sides?.team1 && match.status === 'live' && <span style={{ color: C.textMuted, fontSize: 11, fontFamily: font }}>◀ {match.sides.team1.toUpperCase()}</span>}
                </div>
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  {(match.status === 'live' || match.status === 'completed') ? (
                    <div style={{ fontFamily: font, fontWeight: 900, fontSize: match.status === 'live' ? 26 : 20, color: C.white }}>
                      {match.status === 'live' ? `${match.currentScore?.team1 ?? 0} : ${match.currentScore?.team2 ?? 0}` : `${t1Sets} – ${t2Sets}`}
                    </div>
                  ) : <div style={{ color: C.textMuted, fontWeight: 700, fontFamily: font }}>VS</div>}
                  {match.scores?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 4 }}>
                      {match.scores.map((s, i) => <span key={i} style={{ ...styles.tag(C.elevated, C.textSub), fontSize: 9, fontFamily: font }}>{s.team1}–{s.team2}</span>)}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ color: match.winner?.id === match.team2?.id ? C.green : C.white, fontWeight: 700, fontSize: 15 }}>
                    {match.server === 'team2' && match.status === 'live' && <span style={{ marginRight: 6, color: C.green, fontSize: 11 }}>🏸</span>}
                    {match.team2?.name || 'TBD'}
                  </div>
                  {match.sides?.team2 && match.status === 'live' && <span style={{ color: C.textMuted, fontSize: 11, fontFamily: font }}>{match.sides.team2.toUpperCase()} ▶</span>}
                </div>
              </div>
              {match.winner && <div style={{ textAlign: 'center', marginTop: 10, color: C.green, fontSize: 12, fontWeight: 700 }}>🏆 {match.winner.name}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TOSS FLOW
══════════════════════════════════════════════════════════ */
function TossFlow({ match: initMatch, tournamentData, onMatchReady, onBack }) {
  const [match, setMatch] = useState(initMatch);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('init'); // init → toss_winner → winner_choice → loser_choice → ready
  const [courtNum, setCourtNum] = useState(initMatch.courtNumber || '1');

  const code = tournamentData.tournament.umpireAccessCode;
  const base = { tournamentId: match.tournamentId, categoryId: match.categoryId, matchId: match.id, umpireCode: code };

  const call = async (endpoint, body) => {
    setLoading(true);
    try {
      const res = await API.put(endpoint, { ...base, ...body });
      if (res.data.match) setMatch(prev => ({ ...prev, ...res.data.match }));
      return res.data;
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const initToss = async () => {
    await call('/brackets/match/toss-init', { courtNumber: courtNum });
    setStep('toss_winner');
  };

  const setTossWinner = async (winner) => {
    await call('/brackets/match/toss-result', { tossWinner: winner });
    setStep('winner_choice');
  };

  const winnerChoose = async (choice) => {
    await call('/brackets/match/toss-choice', { choice });
    setStep('loser_choice');
  };

  const loserChoose = async (choice) => {
    await call('/brackets/match/toss-loser-choice', { choice });
    setStep('ready');
  };

  const startMatch = async () => {
    await call('/brackets/match/start', {});
    onMatchReady({ ...match, status: 'live' });
  };

  const toss = match.toss || {};
  const winner = toss.winner;
  const loser = winner === 'team1' ? 'team2' : 'team1';
  const winnerName = winner ? (match[winner]?.name || winner) : '';
  const loserName = loser ? (match[loser]?.name || loser) : '';

  const StepCard = ({ title, sub, children }) => (
    <div style={{ maxWidth: 500, margin: '0 auto', animation: 'slideIn 0.3s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ color: C.white, fontWeight: 800, fontSize: 20, marginBottom: 6 }}>{title}</h2>
        {sub && <p style={{ color: C.textSub, fontSize: 13 }}>{sub}</p>}
      </div>
      {children}
    </div>
  );

  const ChoiceBtn = ({ label, sub, onClick, icon, color = C.brand }) => (
    <button onClick={onClick} disabled={loading} style={{ width: '100%', padding: '18px 20px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s', fontFamily: fontSans }}>
      <div style={{ width: 44, height: 44, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ color: C.white, fontWeight: 700, fontSize: 15 }}>{label}</div>
        {sub && <div style={{ color: C.textSub, fontSize: 12, marginTop: 2 }}>{sub}</div>}
      </div>
      <span style={{ marginLeft: 'auto', color: color, fontSize: 18 }}>›</span>
    </button>
  );

  return (
    <div style={{ ...styles.fullPage, padding: '0 0 40px' }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textSub, cursor: 'pointer', fontSize: 13, fontFamily: fontSans }}>← Back</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: C.amber, fontFamily: font, fontSize: 11, letterSpacing: 3 }}>PRE-MATCH TOSS</div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 13 }}>{match.categoryName} · {match.round} M{match.matchNumber}</div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Teams banner */}
      <div style={{ background: `linear-gradient(135deg, ${C.elevated}, ${C.surface})`, borderBottom: `1px solid ${C.border}`, padding: '16px 20px' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ color: C.white, fontWeight: 800, fontSize: 16 }}>{match.team1?.name}</div>
            <div style={{ color: C.textSub, fontSize: 11, marginTop: 2 }}>Team 1</div>
          </div>
          <div style={{ fontFamily: font, color: C.textMuted, fontWeight: 900, fontSize: 18 }}>VS</div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ color: C.white, fontWeight: 800, fontSize: 16 }}>{match.team2?.name}</div>
            <div style={{ color: C.textSub, fontSize: 11, marginTop: 2 }}>Team 2</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 20px' }}>
        {/* STEP: Court & init */}
        {step === 'init' && (
          <StepCard title="Pre-Match Setup" sub="Set court number before beginning the toss">
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: C.textSub, fontSize: 12, fontFamily: font, letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Court Number</label>
              <input value={courtNum} onChange={e => setCourtNum(e.target.value)} style={{ ...styles.input, padding: '14px 16px', fontSize: 18, fontFamily: font, letterSpacing: 4, textAlign: 'center' }} placeholder="1" />
            </div>
            <button onClick={initToss} disabled={loading} style={{ ...styles.btn(C.amber, C.bg), width: '100%', padding: '16px', fontSize: 16 }}>
              ⚡ Begin Toss
            </button>
          </StepCard>
        )}

        {/* STEP: Who won toss */}
        {step === 'toss_winner' && (
          <StepCard title="Coin Toss" sub="Conduct the coin toss. Which team won?">
            <ChoiceBtn icon="🪙" label={match.team1?.name} sub="Team 1 won the toss" onClick={() => setTossWinner('team1')} />
            <ChoiceBtn icon="🪙" label={match.team2?.name} sub="Team 2 won the toss" onClick={() => setTossWinner('team2')} color={C.green} />
          </StepCard>
        )}

        {/* STEP: Winner's choice */}
        {step === 'winner_choice' && (
          <StepCard title={`${winnerName} Won Toss`} sub="Toss winner chooses their preference">
            <ChoiceBtn icon="🏸" label="Serve First" sub="Start serving from the first point" onClick={() => winnerChoose('serve')} />
            <ChoiceBtn icon="↩" label="Receive First" sub="Opponent serves first" onClick={() => winnerChoose('receive')} color={C.green} />
            <ChoiceBtn icon="◀" label="Choose Left Side" sub="Play from the left half of court" onClick={() => winnerChoose('side_left')} color={C.amber} />
            <ChoiceBtn icon="▶" label="Choose Right Side" sub="Play from the right half of court" onClick={() => winnerChoose('side_right')} color={C.amber} />
          </StepCard>
        )}

        {/* STEP: Loser's remaining choice */}
        {step === 'loser_choice' && (
          <StepCard title={`${loserName}'s Choice`} sub={toss.step === 'loser_side' ? 'Toss loser now chooses which side of court' : 'Toss loser now chooses serve or receive'}>
            {toss.step === 'loser_side' ? (
              <>
                <ChoiceBtn icon="◀" label="Left Side" sub={`${loserName} plays from left`} onClick={() => loserChoose('left')} />
                <ChoiceBtn icon="▶" label="Right Side" sub={`${loserName} plays from right`} onClick={() => loserChoose('right')} color={C.green} />
              </>
            ) : (
              <>
                <ChoiceBtn icon="🏸" label="Serve First" sub="Start serving from the first point" onClick={() => loserChoose('serve')} />
                <ChoiceBtn icon="↩" label="Receive First" sub="Opponent serves first" onClick={() => loserChoose('receive')} color={C.green} />
              </>
            )}
          </StepCard>
        )}

        {/* STEP: Summary before start */}
        {step === 'ready' && (
          <StepCard title="Toss Complete" sub="Review settings and start the match">
            <div style={{ ...styles.card, padding: 24, marginBottom: 24 }}>
              {[
                { label: 'Court', value: `Court ${match.courtNumber || courtNum}`, icon: '🏟' },
                { label: 'First Server', value: toss.firstServer ? (match[toss.firstServer]?.name || toss.firstServer) : '—', icon: '🏸' },
                { label: 'First Receiver', value: toss.firstReceiver ? (match[toss.firstReceiver]?.name || toss.firstReceiver) : '—', icon: '↩' },
                { label: `${match.team1?.name} Side`, value: toss.team1Side ? toss.team1Side.toUpperCase() : '—', icon: '◀▶' },
                { label: `${match.team2?.name} Side`, value: toss.team2Side ? toss.team2Side.toUpperCase() : '—', icon: '◀▶' },
                { label: 'Format', value: `Best of ${match.rules?.bestOf || 3} · ${match.rules?.pointsPerSet || 21} pts`, icon: '📋' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.textSub, fontSize: 13 }}>{r.icon} {r.label}</span>
                  <span style={{ color: C.white, fontWeight: 700, fontSize: 13, fontFamily: font }}>{r.value}</span>
                </div>
              ))}
            </div>
            <button onClick={startMatch} disabled={loading} style={{ ...styles.btn(C.red, C.white), width: '100%', padding: '18px', fontSize: 17, boxShadow: glow(C.red) }}>
              {loading ? '...' : '▶ START MATCH'}
            </button>
          </StepCard>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LIVE SCORING
══════════════════════════════════════════════════════════ */
function ScoringScreen({ match: initMatch, tournamentData, onBack, onComplete }) {
  const [match, setMatch] = useState(initMatch);
  const [flash, setFlash] = useState(null);
  const [busy, setBusy] = useState(false);
  const [midSwitchAlert, setMidSwitchAlert] = useState(false);

  const rules = match.rules || { bestOf: 3, pointsPerSet: 21, deuce: true, maxCap: 30 };
  const setsToWin = Math.ceil((rules.bestOf || 3) / 2);
  const t1Sets = match.scores?.filter(s => s.winner === 'team1').length || 0;
  const t2Sets = match.scores?.filter(s => s.winner === 'team2').length || 0;
  const t1Pts = match.currentScore?.team1 ?? 0;
  const t2Pts = match.currentScore?.team2 ?? 0;
  const code = tournamentData.tournament.umpireAccessCode;
  const base = { tournamentId: match.tournamentId, categoryId: match.categoryId, matchId: match.id, umpireCode: code };

  const addPoint = useCallback(async (scorer) => {
    if (busy || match.status !== 'live') return;
    setBusy(true);
    setFlash(scorer);
    setTimeout(() => setFlash(null), 300);
    try {
      const res = await API.put('/brackets/match/score', { ...base, scorer });
      const updated = res.data.bracket?.rounds?.flat().find(m => m.id === match.id);
      if (updated) {
        setMatch(prev => ({ ...prev, ...updated }));
        if (updated.midSetSwitch) { setMidSwitchAlert(true); setTimeout(() => setMidSwitchAlert(false), 3000); }
        if (updated.status === 'completed') onComplete({ ...match, ...updated });
      }
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    setBusy(false);
  }, [busy, match, base, onComplete]);

  const undo = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await API.put('/brackets/match/undo', base);
      const updated = res.data.bracket?.rounds?.flat().find(m => m.id === match.id);
      if (updated) setMatch(prev => ({ ...prev, ...updated }));
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    setBusy(false);
  }, [busy, match, base]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') addPoint('team1');
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') addPoint('team2');
      else if (e.key === 'z' || e.key === 'Z' || e.key === 'Backspace') undo();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [addPoint, undo]);

  const ptsNeeded = rules.pointsPerSet || 21;
  const isDeuceActive = rules.deuce && t1Pts >= ptsNeeded - 1 && t2Pts >= ptsNeeded - 1;
  const isMatchPt = (t1Pts >= ptsNeeded - 1 && t1Sets === setsToWin - 1) || (t2Pts >= ptsNeeded - 1 && t2Sets === setsToWin - 1);
  const isSetPt = !isMatchPt && (t1Pts >= ptsNeeded - 1 || t2Pts >= ptsNeeded - 1) && !isDeuceActive;
  const currentSetNum = match.currentSet + 1;

  return (
    <div style={{ ...styles.fullPage, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <style>{`
        @keyframes flashGreen{0%{background:rgba(0,230,118,0.25)}100%{background:transparent}}
        @keyframes flashRed{0%{background:rgba(255,23,68,0.25)}100%{background:transparent}}
        @keyframes bounceIn{0%{transform:scale(0.8);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        @keyframes slideDown{from{transform:translateY(-40px);opacity:0}to{transform:translateY(0);opacity:1}}
      `}</style>

      {/* STATUS BAR */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textSub, cursor: 'pointer', fontSize: 12, fontFamily: fontSans }}>← Back</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 7, height: 7, background: C.red, borderRadius: '50%', boxShadow: glow(C.red) }} />
            <span style={{ fontFamily: font, color: C.red, fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>LIVE MATCH</span>
          </div>
          <div style={{ color: C.textSub, fontSize: 11, marginTop: 1 }}>{match.categoryName} · {match.round} M{match.matchNumber} · CT {match.courtNumber}</div>
        </div>
        <div style={{ color: C.textMuted, fontSize: 11, fontFamily: font }}>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>

      {/* ALERT BANNER */}
      {(isMatchPt || isDeuceActive || isSetPt || midSwitchAlert) && (
        <div style={{ background: isMatchPt ? C.red : isDeuceActive ? C.amber : isSetPt ? '#7c3aed' : C.brand, padding: '8px', textAlign: 'center', fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', fontFamily: font, animation: 'slideDown 0.3s ease', flexShrink: 0 }}>
          {isMatchPt ? '🏆 MATCH POINT' : isDeuceActive ? `⚡ DEUCE  ${t1Pts} – ${t2Pts}` : isSetPt ? '⚠ SET POINT' : '🔄 SIDES SWITCHED'}
        </div>
      )}

      {/* SET TRACKER */}
      <div style={{ background: C.elevated, borderBottom: `1px solid ${C.border}`, padding: '10px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <span style={{ fontFamily: font, fontSize: 20, fontWeight: 900, color: C.white, minWidth: 24, textAlign: 'right' }}>{t1Sets}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: rules.bestOf || 3 }).map((_, i) => {
              const won1 = i < t1Sets, won2 = i < t2Sets, curr = !won1 && !won2 && i === t1Sets + t2Sets;
              return (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 8, border: `2px solid ${curr ? C.brand : won1 ? C.green : won2 ? C.red : C.border}`, background: curr ? C.brandDim : won1 ? C.greenDim : won2 ? C.redDim : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontSize: 11, fontWeight: 800, color: curr ? C.brand : won1 ? C.green : won2 ? C.red : C.textMuted, transition: 'all 0.3s' }}>
                  {curr ? `S${i + 1}` : won1 ? '✓' : won2 ? '✓' : `${i + 1}`}
                </div>
              );
            })}
          </div>
          <span style={{ fontFamily: font, fontSize: 20, fontWeight: 900, color: C.white, minWidth: 24 }}>{t2Sets}</span>
        </div>
        {match.scores?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6 }}>
            {match.scores.map((s, i) => (
              <span key={i} style={{ ...styles.tag(C.elevated, C.textSub), fontFamily: font, fontSize: 10, border: `1px solid ${C.border}` }}>S{i + 1}: {s.team1}–{s.team2}</span>
            ))}
          </div>
        )}
      </div>

      {/* SIDE INDICATORS */}
      {match.sides && (
        <div style={{ display: 'flex', background: C.bg, padding: '6px 16px', flexShrink: 0 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontFamily: font, fontSize: 10, color: C.textMuted, letterSpacing: 2 }}>◀ {(match.sides.team1 || '').toUpperCase()}</span>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontFamily: font, fontSize: 10, color: C.textMuted, letterSpacing: 2 }}>SET {currentSetNum}</span>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontFamily: font, fontSize: 10, color: C.textMuted, letterSpacing: 2 }}>{(match.sides.team2 || '').toUpperCase()} ▶</span>
          </div>
        </div>
      )}

      {/* MAIN SCORING PANELS */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* TEAM 1 */}
        <div onClick={() => addPoint('team1')}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: flash === 'team1' ? 'rgba(0,212,255,0.12)' : 'transparent', transition: 'background 0.1s', borderRight: `1px solid ${C.border}`, padding: '20px 12px', position: 'relative', animation: flash === 'team1' ? 'flashGreen 0.3s ease' : 'none' }}>
          {match.server === 'team1' && (
            <div style={{ position: 'absolute', top: 16, right: 16, background: C.greenDim, border: `1px solid ${C.green}40`, color: C.green, fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20, fontFamily: font, letterSpacing: 1 }}>🏸 SERVING</div>
          )}
          <div style={{ color: C.textSub, fontSize: 11, fontFamily: font, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center', lineHeight: 1.4 }}>{match.team1?.name}</div>
          <div style={{ fontFamily: font, fontSize: '16vw', fontWeight: 900, color: flash === 'team1' ? C.brand : C.white, lineHeight: 1, transition: 'color 0.1s', textShadow: flash === 'team1' ? glow(C.brand) : 'none' }}>{t1Pts}</div>
          <div style={{ color: C.textMuted, fontSize: 11, marginTop: 16, fontFamily: font }}>← A</div>
        </div>

        {/* CENTER */}
        <div style={{ width: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ color: C.textMuted, fontFamily: font, fontWeight: 900, fontSize: 14 }}>:</div>
          <button onClick={undo} disabled={busy} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, padding: '10px 0', cursor: 'pointer', writingMode: 'vertical-lr', fontSize: 9, fontFamily: font, letterSpacing: 2, width: 32, transition: 'all 0.15s' }}>UNDO</button>
        </div>

        {/* TEAM 2 */}
        <div onClick={() => addPoint('team2')}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: flash === 'team2' ? 'rgba(255,23,68,0.12)' : 'transparent', transition: 'background 0.1s', borderLeft: `1px solid ${C.border}`, padding: '20px 12px', position: 'relative', animation: flash === 'team2' ? 'flashRed 0.3s ease' : 'none' }}>
          {match.server === 'team2' && (
            <div style={{ position: 'absolute', top: 16, left: 16, background: C.greenDim, border: `1px solid ${C.green}40`, color: C.green, fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20, fontFamily: font, letterSpacing: 1 }}>🏸 SERVING</div>
          )}
          <div style={{ color: C.textSub, fontSize: 11, fontFamily: font, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center', lineHeight: 1.4 }}>{match.team2?.name}</div>
          <div style={{ fontFamily: font, fontSize: '16vw', fontWeight: 900, color: flash === 'team2' ? C.red : C.white, lineHeight: 1, transition: 'color 0.1s', textShadow: flash === 'team2' ? glow(C.red) : 'none' }}>{t2Pts}</div>
          <div style={{ color: C.textMuted, fontSize: 11, marginTop: 16, fontFamily: font }}>D →</div>
        </div>
      </div>

      {/* KEYBOARD HINT */}
      <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: '8px', textAlign: 'center', flexShrink: 0 }}>
        <span style={{ color: C.textMuted, fontSize: 11, fontFamily: font }}>← / A &nbsp;·&nbsp; → / D &nbsp;·&nbsp; Z / BKSP = UNDO</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MATCH COMPLETE OVERLAY
══════════════════════════════════════════════════════════ */
function MatchComplete({ match, onBack }) {
  const t1Sets = match.scores?.filter(s => s.winner === 'team1').length || 0;
  const t2Sets = match.scores?.filter(s => s.winner === 'team2').length || 0;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
      <style>{`@keyframes bounceIn{0%{transform:scale(0.7);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{ background: C.surface, border: `1px solid ${C.green}40`, borderRadius: 24, padding: '48px 40px', textAlign: 'center', maxWidth: 400, width: '100%', animation: 'bounceIn 0.5s cubic-bezier(.36,.07,.19,.97)' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🏆</div>
        <div style={{ fontFamily: font, color: C.green, fontSize: 10, letterSpacing: 4, marginBottom: 12 }}>MATCH COMPLETE</div>
        <h2 style={{ color: C.white, fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{match.winner?.name}</h2>
        <p style={{ color: C.textSub, marginBottom: 24, fontSize: 13 }}>Wins the match</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: font, color: C.white, fontSize: 28, fontWeight: 900 }}>{t1Sets}</div>
            <div style={{ color: C.textSub, fontSize: 11, marginTop: 2 }}>{match.team1?.name}</div>
          </div>
          <div style={{ color: C.textMuted, fontFamily: font, fontSize: 20, alignSelf: 'center' }}>–</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: font, color: C.white, fontSize: 28, fontWeight: 900 }}>{t2Sets}</div>
            <div style={{ color: C.textSub, fontSize: 11, marginTop: 2 }}>{match.team2?.name}</div>
          </div>
        </div>

        {match.scores?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
            {match.scores.map((s, i) => (
              <div key={i} style={{ background: C.elevated, borderRadius: 8, padding: '8px 12px', fontFamily: font, color: C.textSub, fontSize: 13 }}>{s.team1}–{s.team2}</div>
            ))}
          </div>
        )}
        <button onClick={onBack} style={{ ...styles.btn(C.brand, C.bg), width: '100%', padding: '14px', fontSize: 15 }}>← Back to Matches</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════ */
export default function UmpirePortalPage() {
  const [screen, setScreen] = useState('login'); // login | list | toss | scoring | complete
  const [tournamentData, setTournamentData] = useState(null);
  const [code, setCode] = useState('');
  const [activeMatch, setActiveMatch] = useState(null);
  const [completedMatch, setCompletedMatch] = useState(null);

  // Poll match list every 10s when on list screen
  useEffect(() => {
    if (screen !== 'list' || !code) return;
    const i = setInterval(async () => {
      try { const r = await API.post('/brackets/umpire/lookup', { code }); setTournamentData(r.data); } catch {}
    }, 10000);
    return () => clearInterval(i);
  }, [screen, code]);

  const refreshList = useCallback(async () => {
    try { const r = await API.post('/brackets/umpire/lookup', { code }); setTournamentData(r.data); } catch {}
  }, [code]);

  if (screen === 'login') return <LoginScreen onSuccess={(data, c) => { setTournamentData(data); setCode(c); setScreen('list'); }} />;
  if (screen === 'complete') return <MatchComplete match={completedMatch} onBack={async () => { await refreshList(); setScreen('list'); }} />;
  if (screen === 'scoring') return (
    <ScoringScreen
      match={activeMatch}
      tournamentData={tournamentData}
      onBack={async () => { await refreshList(); setScreen('list'); }}
      onComplete={(m) => { setCompletedMatch(m); setScreen('complete'); }}
    />
  );
  if (screen === 'toss') return (
    <TossFlow
      match={activeMatch}
      tournamentData={tournamentData}
      onMatchReady={(m) => { setActiveMatch(m); setScreen('scoring'); }}
      onBack={async () => { await refreshList(); setScreen('list'); }}
    />
  );

  return (
    <MatchList
      data={tournamentData}
      onSelectMatch={(m) => {
        setActiveMatch(m);
        if (m.status === 'live') setScreen('scoring');
        else setScreen('toss');
      }}
      onBack={() => { setTournamentData(null); setCode(''); setScreen('login'); }}
    />
  );
}
