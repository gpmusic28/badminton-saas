import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

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

  const isBye = match.team1IsBye || match.team2IsBye;
  const t1Sets = match.scores?.filter(s => s.team1 > s.team2).length || 0;
  const t2Sets = match.scores?.filter(s => s.team2 > s.team1).length || 0;

  return (
    <div style={{ width: 210, border: `2px solid ${statusColors[match.status] || '#e2e8f0'}`, borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', margin: '5px 0' }}>
      <div style={{ background: match.status === 'live' ? '#10b981' : match.status === 'completed' ? '#3b82f6' : '#f8fafc', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: match.status === 'live' || match.status === 'completed' ? '#fff' : '#94a3b8' }}>
        <span>{match.round} M{match.matchNumber}</span>
        <span>{statusLabels[match.status] || '⏳'}</span>
      </div>
      {[{ team: match.team1, isBye: match.team1IsBye, side: 'team1' }, { team: match.team2, isBye: match.team2IsBye, side: 'team2' }].map((slot, i) => {
        const isWinner = match.winner?.id === slot.team?.id;
        const setScore = i === 0 ? t1Sets : t2Sets;
        const ptScore = i === 0 ? match.currentScore?.team1 : match.currentScore?.team2;
        return (
          <div key={i} style={{ padding: '8px 12px', borderBottom: i === 0 ? '1px solid #f1f5f9' : 'none', background: isWinner ? '#eff6ff' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: isWinner ? 800 : 500, color: slot.isBye ? '#94a3b8' : isWinner ? '#1e40af' : '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

  useEffect(() => { load(); const i = setInterval(load, 5000); return () => clearInterval(i); }, [id, categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}>Loading bracket...</div>;
  if (!data?.bracket) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
      <h3>Bracket not generated yet</h3>
      <p style={{ color: '#64748b', marginTop: 8 }}>The organizer hasn't generated the bracket yet</p>
    </div>
  );

  const { bracket } = data;
  const isOrganizer = user && tournament?.organizer === user.id;

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
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

      {/* Bracket */}
      <div style={{ overflowX: 'auto', paddingBottom: 20 }}>
        <div style={{ display: 'flex', gap: 32, minWidth: 'fit-content', alignItems: 'flex-start' }}>
          {bracket.rounds?.map((round, rIdx) => {
            const roundName = rIdx === bracket.totalRounds - 1 ? 'FINAL' : rIdx === bracket.totalRounds - 2 ? 'SEMI FINALS' : rIdx === bracket.totalRounds - 3 ? 'QUARTER FINALS' : `ROUND ${rIdx + 1}`;
            const liveCount = round.filter(m => m.status === 'live').length;
            return (
              <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, background: '#f1f5f9', padding: '5px 14px', borderRadius: 20, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {roundName}
                  {liveCount > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10 }}>🔴 {liveCount}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {round.map(match => (
                    <MatchCard key={match.id} match={match} isOrganizer={isOrganizer} tournamentId={id} categoryId={categoryId} onRefresh={load} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
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
