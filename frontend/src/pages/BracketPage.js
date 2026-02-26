import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
const matchRefs = React.useRef({});
const pulseStyle = `
@keyframes livePulse {
  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }
  70% { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}
`;
function MatchCard({ match, onStart, isOrganizer, tournamentId, categoryId, onRefresh }) {
  const [showStart, setShowStart] = useState(false);
  const [court, setCourt] = useState('1');
  const [server, setServer] = useState('team1');
  const [loading, setLoading] = useState(false);

  const statusColors = { pending: '#e2e8f0', live: '#bbf7d0', completed: '#dbeafe', scheduled: '#fef3c7' };
  const statusLabels = { pending: '⏳', live: '🔴 LIVE', completed: '✅', scheduled: '📅' };

  const startMatch = async () => {
    setLoading(true);
    try {
      await API.put('/brackets/match/start', { tournamentId, categoryId, matchId: match.id, courtNumber: court, server });
      setShowStart(false);
      onRefresh();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    setLoading(false);
  };
const renderConnectors = () => {
  if (!bracket?.rounds) return null;

  const lines = [];

  bracket.rounds.forEach((round, rIdx) => {
    if (rIdx === bracket.rounds.length - 1) return;

    round.forEach((match, mIdx) => {
      const nextMatch =
        bracket.rounds[rIdx + 1][Math.floor(mIdx / 2)];

      if (!nextMatch) return;

      const fromEl = matchRefs.current[match.id];
      const toEl = matchRefs.current[nextMatch.id];

      if (!fromEl || !toEl) return;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      const containerRect =
        containerRef.current.getBoundingClientRect();

      const x1 = fromRect.right - containerRect.left;
      const y1 =
        fromRect.top +
        fromRect.height / 2 -
        containerRect.top;

      const x2 = toRect.left - containerRect.left;
      const y2 =
        toRect.top +
        toRect.height / 2 -
        containerRect.top;

      const isWinnerPath =
        nextMatch.winner &&
        (nextMatch.winner.id === match.team1?.id ||
          nextMatch.winner.id === match.team2?.id);

      lines.push(
        <path
          key={`${match.id}-${nextMatch.id}`}
          d={`M ${x1} ${y1}
              H ${x1 + 40}
              V ${y2}
              H ${x2}`}
          fill="none"
          stroke={isWinnerPath ? '#22c55e' : '#cbd5e1'}
          strokeWidth={isWinnerPath ? 3 : 1.5}
          style={{
            transition: 'all 0.4s ease'
          }}
        />
      );
    });
  });

  return lines;
};
const [, forceUpdate] = useState(0);

useEffect(() => {
  const handleResize = () =>
    forceUpdate(n => n + 1);
  window.addEventListener('resize', handleResize);
  return () =>
    window.removeEventListener('resize', handleResize);
}, []);
  const isBye = match.team1IsBye || match.team2IsBye;
  const t1Sets = match.scores?.filter(s => s.team1 > s.team2).length || 0;
  const t2Sets = match.scores?.filter(s => s.team2 > s.team1).length || 0;

  return (
    <div
  style={{
    width: 230,
    borderRadius: 14,
    overflow: 'hidden',
    background:
  match.status === 'completed'
    ? '#ffffff'
    : '#243447',
    color: '#f1f5f9',
    border: match.winner
      ? '2px solid #22d3ee'
      : match.status === 'live'
      ? '2px solid #10b981'
      : '1px solid #334155',
    boxShadow:
      match.status === 'live'
        ? '0 0 18px rgba(16,185,129,0.6)'
        : '0 6px 18px rgba(0,0,0,0.35)',
    margin: '8px 0',
    transition: 'all 0.3s ease',
    animation: match.status === 'live'
      ? 'livePulse 1.8s infinite'
      : 'none'
  }}
>
      <div style={{ background:
  match.status === 'live'
    ? 'linear-gradient(90deg, #10b981, #059669)'
    : match.status === 'completed'
    ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
    : '#334155', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: match.status === 'live' || match.status === 'completed' ? '#fff' : '#94a3b8' }}>
        <span>{match.round} M{match.matchNumber}</span>
        <span>{statusLabels[match.status] || '⏳'}</span>
      </div>
      {[{ team: match.team1, isBye: match.team1IsBye, side: 'team1' }, { team: match.team2, isBye: match.team2IsBye, side: 'team2' }].map((slot, i) => {
        const isWinner = match.winner?.id === slot.team?.id;
        const setScore = i === 0 ? t1Sets : t2Sets;
        const ptScore = i === 0 ? match.currentScore?.team1 : match.currentScore?.team2;
        return (
          <div key={i} style={{ padding: '8px 12px', borderBottom: i === 0 ? '1px solid #f1f5f9' : 'none', background: isWinner ? '#eff6ff' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: isWinner ? 800 : 500, color: slot.isBye
  ? '#94a3b8'
  : match.status === 'completed'
  ? '#1e293b'
  : '#f1f5f9', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isWinner && '✓ '}{slot.isBye ? '— BYE —' : slot.team?.name || 'TBD'}
            </span>
            {(match.status === 'live' || match.status === 'completed') && !slot.isBye && (
              <span style={{ fontWeight: 900, fontSize: 16, color: '#1e293b', marginLeft: 8, fontFamily: 'monospace' }}>
                {match.status === 'completed' ? setScore : ptScore ?? '0'}
              </span>
            )}
          </div>
        );
      })}
      {isOrganizer && match.status === 'pending' && !isBye && match.team1 && match.team2 && (
        <div style={{ padding: '8px 10px', borderTop: '1px solid #f1f5f9' }}>
          {!showStart ? (
            <button onClick={() => setShowStart(true)} style={{ width: '100%', padding: '6px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>▶ Start Match</button>
          ) : (
            <div>
              <input value={court} onChange={e => setCourt(e.target.value)} placeholder="Court #" style={{ width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 12, marginBottom: 4 }} />
              <select value={server} onChange={e => setServer(e.target.value)} style={{ width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 12, marginBottom: 6 }}>
                <option value="team1">Serving: {match.team1?.name?.substring(0, 15)}</option>
                <option value="team2">Serving: {match.team2?.name?.substring(0, 15)}</option>
              </select>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={startMatch} disabled={loading} style={{ flex: 1, padding: '5px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>
                  {loading ? '...' : '✓ GO'}
                </button>
                <button onClick={() => setShowStart(false)} style={{ padding: '5px 8px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11 }}>✕</button>
              </div>
            </div>
          )}
        </div>
      )}
      {match.status === 'live' && (
        <div style={{ background: '#dcfce7', padding: '4px 10px', fontSize: 11, color: '#16a34a', fontWeight: 700, textAlign: 'center', borderTop: '1px solid #bbf7d0' }}>
          🔴 LIVE {match.courtNumber ? `— Court ${match.courtNumber}` : ''}
        </div>
      )}
    </div>
  );
}

export default function BracketPage() {
  const { id, categoryId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [umpireCode, setUmpireCode] = useState('');
  const containerRef = React.useRef(null);
const [scale, setScale] = useState(1);
const [isDragging, setIsDragging] = useState(false);
const [startX, setStartX] = useState(0);
const [scrollLeft, setScrollLeft] = useState(0);

  const load = async () => {
    try {
      const res = await API.get(`/brackets/${id}/${categoryId}`);
      setData(res.data);
      if (user) {
        API.get(`/tournaments/my`).then(r => setTournament(r.data?.find(t => t._id === id)));
        API.get(`/brackets/${id}/umpire-code`).then(r => setUmpireCode(r.data.umpireAccessCode)).catch(() => {});
      }
    } catch { }
    setLoading(false);
  };

  useEffect(() => {
  load();
  const i = setInterval(load, 5000);
  return () => clearInterval(i);
}, [id, categoryId]);

// Auto-focus LIVE match
useEffect(() => {
  if (!data?.bracket) return;

  const liveMatch = data.bracket.rounds
    ?.flat()
    .find(m => m.status === 'live');

  if (liveMatch) {
    const el = document.getElementById(`match-${liveMatch.id}`);
    if (el && containerRef.current) {
      containerRef.current.scrollTo({
        left: el.offsetLeft - 300,
        behavior: 'smooth'
      });
    }
  }
}, [data]);
  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}>Loading bracket...</div>;
  if (!data?.bracket) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
      <h3>Bracket not generated yet</h3>
      <p style={{ color: '#64748b', marginTop: 8 }}>The organizer hasn't generated the bracket yet</p>
    </div>
  );

  const { bracket } = data;
  const finalRound = bracket.rounds[bracket.rounds.length - 1];
const finalMatch = finalRound?.[0];
const champion = finalMatch?.winner?.name || null;
  const isOrganizer = user && tournament?.organizer === user.id;

  return (
    <div style={{
  padding: '24px 16px',
  maxWidth: 1400,
  margin: '0 auto',
  borderRadius: 12,
  minHeight: '100vh'
}}>
      <style>{pulseStyle}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>🏆 {data.category}</h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { l: 'Teams', v: bracket.totalTeams, c: '#3b82f6' },
              { l: 'Slots', v: bracket.totalSlots, c: '#8b5cf6' },
              { l: 'BYEs', v: bracket.byeCount, c: '#f59e0b' },
              { l: 'Rounds', v: bracket.totalRounds, c: '#10b981' },
              { l: 'Live', v: bracket.rounds?.flat().filter(m => m.status === 'live').length || 0, c: '#ef4444' },
              { l: 'Done', v: bracket.rounds?.flat().filter(m => m.status === 'completed').length || 0, c: '#64748b' }
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        {umpireCode && (
          <div style={{ background: '#1e3a5f', borderRadius: 12, padding: '12px 20px', color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>UMPIRE ACCESS CODE</div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', letterSpacing: 4 }}>{umpireCode}</div>
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>Share with umpires → /umpire</div>
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>🔄 Auto-refreshing every 5 seconds</div>

      {/* PRO BRACKET SYSTEM */}
<div
  ref={containerRef}
  style={{
    overflow: 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
    padding: '60px 40px',
    background: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)',
    borderRadius: 12
  }}
  onMouseDown={(e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  }}
  onMouseLeave={() => setIsDragging(false)}
  onMouseUp={() => setIsDragging(false)}
  onMouseMove={(e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  }}
>
  <div
    style={{
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      display: 'flex',
      gap: 120,
      position: 'relative'
    }}
  >
    <svg
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'visible'
  }}
>
  {renderConnectors()}
</svg>
    <div style={{
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  pointerEvents: 'none'
}} />
    {bracket.rounds.map((round, rIdx) => (
      <div
        key={rIdx}
        style={{
  display: 'flex',
  flexDirection: 'column',
  gap: `${60 * Math.pow(2, rIdx)}px`,
  justifyContent: 'center'
}}
      >
        {round.map(match => {
          const isChampionPath =
  champion &&
  (
    match.team1?.name === champion ||
    match.team2?.name === champion ||
    match.winner?.name === champion
  );

          return (
            <div
  key={match.id}
  id={`match-${match.id}`}
  ref={el => (matchRefs.current[match.id] = el)}
              style={{
  position: 'relative',
  margin: '20px 0',
  opacity: 1,
  transition: 'all 0.4s ease'
}}
            >
              <MatchCard
                match={match}
                isOrganizer={isOrganizer}
                tournamentId={id}
                categoryId={categoryId}
                onRefresh={load}
              />
        
            </div>
            
          );
        })}
      </div>
    ))}

    {/* Champion Box */}
    <div style={{
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        background: '#facc15',
        padding: '20px 40px',
        borderRadius: 12,
        fontWeight: 900,
        fontSize: 20,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
      }}>
        🏆 {champion || 'TBD'}
      </div>
    </div>
  </div>
</div>

{/* ZOOM CONTROLS */}
<div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
  <button onClick={() => setScale(s => Math.max(0.6, s - 0.1))}>
    ➖ Zoom Out
  </button>
  <button onClick={() => setScale(s => Math.min(1.8, s + 0.1))}>
    ➕ Zoom In
  </button>
  <button onClick={() => setScale(1)}>
    Reset
  </button>
</div>

      {/* Legend */}
      <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { color: '#10b981', label: '🔴 Live match' },
          { color: '#3b82f6', label: '✅ Completed' },
          { color: '#f59e0b', label: '⏳ BYE/Pending' },
          { color: '#e2e8f0', label: 'Not started' }
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
