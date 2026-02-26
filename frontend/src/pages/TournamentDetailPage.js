import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const C = { bg:'#04080f',surface:'#0b1220',elevated:'#111c2e',border:'rgba(255,255,255,0.07)',brand:'#00d4ff',brandDim:'rgba(0,212,255,0.1)',green:'#00e676',red:'#ff1744',amber:'#ffab00',text:'#f1f5f9',sub:'#64748b',muted:'#2d3f55' };
const font = "'DM Mono','Fira Code',monospace";
const sans = "'DM Sans','Segoe UI',system-ui,sans-serif";
const glow = c => `0 0 20px ${c}40,0 0 40px ${c}15`;

export default function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [msg, setMsg] = useState({ text:'', ok:true });
  const [copied, setCopied] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const load = useCallback(() => {
    API.get('/tournaments/my').then(r => { setTournament(r.data.find(x=>x._id===id)); setLoading(false); }).catch(()=>setLoading(false));
  }, [id]);

  useEffect(()=>{ load(); },[load]);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(()=>{ setCopied(key); setTimeout(()=>setCopied(''),2200); });
  };

  const generateBracket = async (categoryId) => {
    setGenerating(categoryId); setMsg({text:'',ok:true});
    try {
      const res = await API.post('/brackets/generate',{tournamentId:id,categoryId:categoryId});
      setMsg({text:`✅ Bracket generated — ${res.data.totalTeams} teams, ${res.data.bracket.byeCount} BYEs`,ok:true});
      load();
    } catch(err){ setMsg({text:'❌ '+( err.response?.data?.error||'Failed'),ok:false}); }
    setGenerating(null);
  };

  if (loading) return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:sans}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:12}}>🏸</div>
        <p style={{color:C.sub}}>Loading tournament...</p>
      </div>
    </div>
  );
  if (!tournament) return <div style={{textAlign:'center',padding:60,color:C.sub,fontFamily:sans}}>Tournament not found</div>;

  const umpireUrl = `${window.location.origin}/umpire`;
  const regUrl = `${window.location.origin}/tournaments/${id}/register`;
  const allMatches = tournament.categories?.flatMap(c=>c.bracket?.rounds?.flat()||[]) || [];
  const liveCount = allMatches.filter(m=>m.status==='live').length;
  const totalApproved = allMatches.filter(m=>!m.team1IsBye&&!m.team2IsBye).length;
  const doneCount = allMatches.filter(m=>m.status==='completed').length;

  const tabs = [
    {key:'overview',label:'Overview'},
    {key:'brackets',label:'Brackets & Scoring'},
    {key:'umpire',label:'🔐 Umpire Access'},
    {key:'links',label:'Share & Links'},
  ];

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:sans,color:C.text}}>
      <style>{`
        @keyframes pulse2{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .tab-btn:hover{background:rgba(255,255,255,0.06)!important}
        .action-btn:hover{opacity:0.85}
        .cat-row:hover{border-color:rgba(0,212,255,0.3)!important}
      `}</style>

      {/* TOP NAV */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'0 24px',position:'sticky',top:0,zIndex:50}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',gap:16,height:58}}>
          <button onClick={()=>navigate('/dashboard')} style={{background:'none',border:'none',color:C.sub,cursor:'pointer',fontSize:13,fontFamily:sans,display:'flex',alignItems:'center',gap:4,padding:0}}>
            ← Dashboard
          </button>
          <span style={{color:C.muted}}>›</span>
          <span style={{color:C.text,fontWeight:600,fontSize:14}}>{tournament.name}</span>
          <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
            {liveCount>0 && (
              <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(255,23,68,0.1)',border:'1px solid rgba(255,23,68,0.3)',borderRadius:20,padding:'4px 12px'}}>
                <div style={{width:6,height:6,background:C.red,borderRadius:'50%',animation:'pulse2 1s infinite',boxShadow:glow(C.red)}}/>
                <span style={{color:'#ffa0b0',fontSize:12,fontWeight:700,fontFamily:font}}>{liveCount} LIVE</span>
              </div>
            )}
            <span style={{background:'rgba(0,0,0,0.3)',border:`1px solid ${C.border}`,color:C.sub,borderRadius:8,padding:'5px 12px',fontSize:12}}>
              {tournament.status?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{background:`linear-gradient(160deg,#0b1728 0%,#0a1525 60%,#07101e 100%)`,borderBottom:`1px solid ${C.border}`,padding:'32px 24px 0'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <h1 style={{fontSize:28,fontWeight:900,color:C.text,margin:'0 0 6px',letterSpacing:-0.5}}>{tournament.name}</h1>
          <div style={{display:'flex',gap:20,flexWrap:'wrap',marginBottom:24}}>
            <span style={{color:C.sub,fontSize:14}}>📍 {tournament.venue}</span>
            <span style={{color:C.sub,fontSize:14}}>📅 {new Date(tournament.startDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} — {new Date(tournament.endDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
            {tournament.contactPhone&&<span style={{color:C.sub,fontSize:14}}>📞 {tournament.contactPhone}</span>}
          </div>
          {/* Stats row */}
          <div style={{display:'flex',gap:24,flexWrap:'wrap',marginBottom:20}}>
            {[
              {l:'Categories',v:tournament.categories?.length||0,c:C.brand},
              {l:'Total Matches',v:totalApproved,c:C.sub},
              {l:'Live Now',v:liveCount,c:C.red},
              {l:'Completed',v:doneCount,c:C.green},
              {l:'Entry Fee',v:tournament.requirePayment?`₹${tournament.entryFee}`:'FREE',c:C.amber},
            ].map(s=>(
              <div key={s.l} style={{textAlign:'center',minWidth:70}}>
                <div style={{fontFamily:font,fontSize:22,fontWeight:900,color:s.c}}>{s.v}</div>
                <div style={{color:C.muted,fontSize:10,textTransform:'uppercase',letterSpacing:1,marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
          {/* Tabs */}
          <div style={{display:'flex',gap:0}}>
            {tabs.map(t=>(
              <button key={t.key} className="tab-btn" onClick={()=>setActiveTab(t.key)}
                style={{padding:'10px 20px',background:'transparent',border:'none',borderBottom:`2px solid ${activeTab===t.key?C.brand:'transparent'}`,color:activeTab===t.key?C.brand:C.sub,cursor:'pointer',fontWeight:activeTab===t.key?700:400,fontSize:13,fontFamily:sans,transition:'all 0.2s'}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'28px 24px'}}>
        {msg.text && (
          <div style={{background:msg.ok?'rgba(0,230,118,0.08)':'rgba(255,23,68,0.08)',border:`1px solid ${msg.ok?C.green+'40':C.red+'40'}`,color:msg.ok?C.green:'#ffa0b0',padding:'12px 18px',borderRadius:10,marginBottom:20,fontSize:13,fontWeight:600,animation:'fadeUp 0.3s ease'}}>
            {msg.text}
          </div>
        )}

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab==='overview' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
            {/* Quick actions */}
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22,gridColumn:'span 2'}}>
              <div style={{color:C.sub,fontSize:11,fontFamily:font,letterSpacing:3,textTransform:'uppercase',marginBottom:16}}>Quick Actions</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  {label:'Manage Registrations',icon:'📋',action:()=>navigate(`/tournaments/${id}/registrations`),color:C.brand},
                  {label:'Open Umpire Portal',icon:'🏸',action:()=>window.open('/umpire','_blank'),color:C.green},
                  {label:'View Registration Form',icon:'🔗',action:()=>window.open(regUrl,'_blank'),color:C.amber},
                  {label:'View All Brackets',icon:'📊',action:()=>setActiveTab('brackets'),color:'#a78bfa'},
                ].map(a=>(
                  <button key={a.label} className="action-btn" onClick={a.action}
                    style={{background:C.elevated,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 16px',cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:10,transition:'all 0.15s',fontFamily:sans}}>
                    <span style={{fontSize:20}}>{a.icon}</span>
                    <span style={{color:a.color,fontWeight:600,fontSize:13}}>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Umpire code mini card */}
            <div onClick={()=>setActiveTab('umpire')} style={{background:`linear-gradient(135deg,${C.elevated},${C.surface})`,border:`1px solid ${C.brand}30`,borderRadius:16,padding:22,cursor:'pointer',transition:'all 0.2s'}}>
              <div style={{color:C.sub,fontSize:11,fontFamily:font,letterSpacing:3,textTransform:'uppercase',marginBottom:10}}>Umpire Code</div>
              <div style={{fontFamily:font,fontSize:36,fontWeight:900,color:C.white,letterSpacing:8,marginBottom:8,textShadow:glow(C.brand)}}>{tournament.umpireAccessCode}</div>
              <div style={{color:C.brand,fontSize:12,fontWeight:600}}>Click to manage →</div>
            </div>

            {/* Tournament info */}
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
              <div style={{color:C.sub,fontSize:11,fontFamily:font,letterSpacing:3,textTransform:'uppercase',marginBottom:16}}>Tournament Info</div>
              {[
                ['Organizer',tournament.organizerName||'—'],
                ['Status',tournament.status?.toUpperCase()],
                ['Contact',tournament.contactEmail||'—'],
                ['Phone',tournament.contactPhone||'—'],
                ['Entry',tournament.requirePayment?`₹${tournament.entryFee}`:'Free'],
              ].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.border}`}}>
                  <span style={{color:C.sub,fontSize:13}}>{l}</span>
                  <span style={{color:C.text,fontSize:13,fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>

            {/* Category summary */}
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22,gridColumn:'span 2'}}>
              <div style={{color:C.sub,fontSize:11,fontFamily:font,letterSpacing:3,textTransform:'uppercase',marginBottom:16}}>Categories Summary</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10}}>
                {tournament.categories?.map(cat=>{
                  const catMatches = cat.bracket?.rounds?.flat()||[];
                  const live = catMatches.filter(m=>m.status==='live').length;
                  return (
                    <div key={cat._id} style={{background:C.elevated,borderRadius:10,padding:14,border:`1px solid ${live>0?C.red+'40':C.border}`}}>
                      <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:4}}>{cat.name}</div>
                      <div style={{color:C.sub,fontSize:11}}>{cat.type} · {cat.gender}</div>
                      <div style={{marginTop:8,display:'flex',gap:6,flexWrap:'wrap'}}>
                        {cat.bracketGenerated?<span style={{background:'rgba(0,230,118,0.1)',color:C.green,fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10}}>✓ Bracket</span>:<span style={{background:C.bg,color:C.sub,fontSize:10,padding:'2px 8px',borderRadius:10}}>No bracket</span>}
                        {live>0&&<span style={{background:'rgba(255,23,68,0.1)',color:C.red,fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10}}>🔴 {live} Live</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ BRACKETS TAB ══ */}
        {activeTab==='brackets' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{color:C.text,fontWeight:800,fontSize:20,margin:0}}>Brackets & Match Control</h2>
            </div>
            {tournament.categories?.length===0 && (
              <div style={{textAlign:'center',padding:60,color:C.sub,border:`2px dashed ${C.border}`,borderRadius:16}}>No categories added</div>
            )}
            {tournament.categories?.map(cat=>{
              const catMatches = cat.bracket?.rounds?.flat()||[];
              const liveC = catMatches.filter(m=>m.status==='live').length;
              const doneC = catMatches.filter(m=>m.status==='completed').length;
              const totalC = catMatches.filter(m=>!m.team1IsBye&&!m.team2IsBye).length;
              return (
                <div key={cat._id} className="cat-row" style={{background:C.surface,border:`1px solid ${liveC>0?C.red+'40':C.border}`,borderRadius:16,padding:24,marginBottom:14,transition:'all 0.2s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:14}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:8}}>
                        <h3 style={{fontWeight:800,color:C.text,fontSize:17,margin:0}}>{cat.name}</h3>
                        <span style={{background:'rgba(0,212,255,0.1)',color:C.brand,fontSize:10,fontWeight:700,padding:'2px 10px',borderRadius:20,textTransform:'uppercase'}}>{cat.type}</span>
                        <span style={{background:'rgba(255,171,0,0.1)',color:C.amber,fontSize:10,fontWeight:700,padding:'2px 10px',borderRadius:20}}>{cat.gender} · {cat.ageGroup?.toUpperCase()}</span>
                        {liveC>0&&<span style={{background:'rgba(255,23,68,0.1)',color:C.red,fontSize:10,fontWeight:800,padding:'2px 10px',borderRadius:20}}>🔴 {liveC} LIVE</span>}
                        {cat.bracketGenerated&&<span style={{background:'rgba(0,230,118,0.1)',color:C.green,fontSize:10,fontWeight:700,padding:'2px 10px',borderRadius:20}}>✓ Ready</span>}
                      </div>
                      {cat.bracketGenerated&&cat.bracket&&(
                        <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                          {[
                            {l:'Teams',v:cat.bracket.totalTeams,c:C.brand},
                            {l:'Rounds',v:cat.bracket.totalRounds,c:'#a78bfa'},
                            {l:'BYEs',v:cat.bracket.byeCount,c:C.amber},
                            {l:'Done',v:`${doneC}/${totalC}`,c:C.green},
                          ].map(s=>(
                            <div key={s.l} style={{textAlign:'center'}}>
                              <div style={{fontFamily:font,fontSize:18,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
                              <div style={{color:C.muted,fontSize:10,textTransform:'uppercase',letterSpacing:0.5,marginTop:2}}>{s.l}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
                      {!cat.bracketGenerated?(
                        <button onClick={()=>generateBracket(cat._id)} disabled={generating===cat._id}
                          style={{padding:'11px 22px',background:generating===cat._id?C.muted:C.brand,color:C.bg,border:'none',borderRadius:10,cursor:generating===cat._id?'not-allowed':'pointer',fontWeight:800,fontSize:13,fontFamily:sans,boxShadow:generating===cat._id?'none':glow(C.brand)}}>
                          {generating===cat._id?'⏳ Generating...':'⚡ Generate Bracket'}
                        </button>
                      ):(
                        <>
                          <button onClick={()=>generateBracket(cat._id)} disabled={generating===cat._id}
                            style={{padding:'10px 16px',background:'rgba(255,171,0,0.1)',color:C.amber,border:`1px solid ${C.amber}40`,borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:12,fontFamily:sans}}>
                            🔄 Re-draw
                          </button>
                          <button onClick={()=>navigate(`/tournaments/${id}/bracket/${cat._id}`)}
                            style={{padding:'11px 22px',background:C.brand,color:C.bg,border:'none',borderRadius:10,cursor:'pointer',fontWeight:800,fontSize:13,fontFamily:sans}}>
                            📊 Full Bracket →
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ UMPIRE TAB ══ */}
        {activeTab==='umpire' && (
          <div style={{maxWidth:700}}>
            <h2 style={{color:C.text,fontWeight:800,fontSize:20,marginBottom:6}}>🔐 Umpire Access System</h2>
            <p style={{color:C.sub,fontSize:14,marginBottom:28}}>Share this code with umpires. One code gives access to all matches in this tournament.</p>

            {/* GIANT CODE CARD */}
            <div style={{background:`linear-gradient(135deg,#0d1f38,${C.elevated})`,border:`1px solid ${C.brand}30`,borderRadius:20,padding:'36px 32px',marginBottom:20,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-60,right:-60,width:200,height:200,background:`radial-gradient(circle,${C.brand}08,transparent 70%)`,pointerEvents:'none'}}/>
              <div style={{color:C.sub,fontSize:11,fontFamily:font,letterSpacing:4,textTransform:'uppercase',marginBottom:12}}>Tournament Access Code</div>
              <div style={{fontFamily:font,fontSize:64,fontWeight:900,color:C.white,letterSpacing:16,marginBottom:4,lineHeight:1,textShadow:glow(C.brand)}}>
                {tournament.umpireAccessCode}
              </div>
              <p style={{color:C.sub,fontSize:12,marginBottom:24}}>Umpires enter this at: <span style={{color:C.brand,fontFamily:font}}>{umpireUrl}</span></p>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <button onClick={()=>copy(tournament.umpireAccessCode,'code')}
                  style={{padding:'11px 22px',background:copied==='code'?C.green:C.brand,color:C.bg,border:'none',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:sans,transition:'all 0.2s',boxShadow:glow(copied==='code'?C.green:C.brand)}}>
                  {copied==='code'?'✅ Code Copied!':'📋 Copy Code'}
                </button>
                <button onClick={()=>copy(`🏸 *Umpire Access*\nTournament: ${tournament.name}\nCode: *${tournament.umpireAccessCode}*\nPortal: ${umpireUrl}\n\nEnter the code at the portal to access all matches.`,'wa')}
                  style={{padding:'11px 22px',background:copied==='wa'?'rgba(37,211,102,0.2)':'rgba(37,211,102,0.08)',color:'#25d366',border:'1px solid rgba(37,211,102,0.3)',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:sans,transition:'all 0.2s'}}>
                  {copied==='wa'?'✅ Copied!':'💬 Copy WhatsApp Message'}
                </button>
                <button onClick={()=>window.open('/umpire','_blank')}
                  style={{padding:'11px 22px',background:'rgba(0,230,118,0.08)',color:C.green,border:`1px solid ${C.green}30`,borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:sans}}>
                  🏸 Open Portal →
                </button>
              </div>
            </div>

            {/* Step guide */}
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:24,marginBottom:20}}>
              <div style={{color:C.sub,fontSize:11,fontFamily:font,letterSpacing:3,textTransform:'uppercase',marginBottom:18}}>How Umpires Use This</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                {[
                  {n:'1',t:'Share Code',d:`Send code "${tournament.umpireAccessCode}" via WhatsApp, SMS or show on screen`,icon:'📤'},
                  {n:'2',t:'Visit Portal',d:`Open ${window.location.origin}/umpire on phone or tablet`,icon:'📱'},
                  {n:'3',t:'Enter Code',d:'Type the 6-character code on the login screen',icon:'⌨️'},
                  {n:'4',t:'Score Live',d:'Select match → complete toss → tap to score points in real time',icon:'🏸'},
                ].map(s=>(
                  <div key={s.n} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                    <div style={{width:30,height:30,background:C.brandDim,border:`1px solid ${C.brand}30`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:font,fontSize:13,fontWeight:900,color:C.brand}}>{s.n}</div>
                    <div>
                      <div style={{color:C.text,fontWeight:700,fontSize:13,marginBottom:3}}>{s.t} {s.icon}</div>
                      <div style={{color:C.sub,fontSize:12,lineHeight:1.5}}>{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Toss rules reference */}
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:24}}>
              <div style={{color:C.sub,fontSize:11,fontFamily:font,letterSpacing:3,textTransform:'uppercase',marginBottom:16}}>BWF Toss Rules (Built-in)</div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[
                  {icon:'🪙',rule:'Coin toss — winner chooses: serve, receive, or side'},
                  {icon:'↩',rule:'Loser of toss gets remaining choice (serve or side)'},
                  {icon:'🏸',rule:'Rally scoring — point scorer becomes server every rally'},
                  {icon:'🔄',rule:'Sides switch after each set; again at 11 pts in 3rd set'},
                  {icon:'⚡',rule:'Deuce at 20-20; golden point at 29-29; cap at 30'},
                  {icon:'🏆',rule:'Set winner serves first in next set (BWF regulation)'},
                ].map((r,i)=>(
                  <div key={i} style={{display:'flex',gap:10,padding:'10px 14px',background:C.elevated,borderRadius:10,alignItems:'center'}}>
                    <span style={{fontSize:18}}>{r.icon}</span>
                    <span style={{color:C.sub,fontSize:13}}>{r.rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ LINKS TAB ══ */}
        {activeTab==='links' && (
          <div style={{maxWidth:700}}>
            <h2 style={{color:C.text,fontWeight:800,fontSize:20,marginBottom:6}}>Share & Links</h2>
            <p style={{color:C.sub,fontSize:14,marginBottom:24}}>Share these links with participants and officials</p>
            {[
              {label:'Public Registration Form',desc:'Players use this to register for the tournament',url:regUrl,icon:'📝',color:C.green},
              {label:'Umpire Portal',desc:'Umpires use this to score live matches (requires code)',url:umpireUrl,icon:'🏸',color:C.brand},
            ].map(l=>(
              <div key={l.label} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22,marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <span style={{fontSize:24}}>{l.icon}</span>
                  <div>
                    <div style={{color:C.text,fontWeight:700,fontSize:15}}>{l.label}</div>
                    <div style={{color:C.sub,fontSize:12,marginTop:2}}>{l.desc}</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <input value={l.url} readOnly style={{flex:1,background:C.elevated,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 12px',color:C.sub,fontSize:12,fontFamily:font,outline:'none'}}/>
                  <button onClick={()=>copy(l.url,l.label)} style={{padding:'10px 18px',background:copied===l.label?C.green:C.elevated,color:copied===l.label?C.bg:l.color,border:`1px solid ${copied===l.label?C.green:C.border}`,borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:12,fontFamily:sans,whiteSpace:'nowrap',transition:'all 0.2s'}}>
                    {copied===l.label?'✅ Copied!':'Copy'}
                  </button>
                  <button onClick={()=>window.open(l.url,'_blank')} style={{padding:'10px 14px',background:C.elevated,color:C.sub,border:`1px solid ${C.border}`,borderRadius:8,cursor:'pointer',fontSize:12,fontFamily:sans}}>↗</button>
                </div>
              </div>
            ))}

            {tournament.requirePayment&&(
              <div style={{background:C.surface,border:`1px solid ${C.amber}30`,borderRadius:16,padding:22}}>
                <div style={{color:C.amber,fontWeight:700,fontSize:15,marginBottom:12}}>💰 Payment Details</div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{color:C.sub}}>Entry Fee</span>
                  <span style={{color:C.text,fontWeight:800,fontFamily:font,fontSize:18}}>₹{tournament.entryFee}</span>
                </div>
                {tournament.paymentDetails&&<div style={{background:C.elevated,borderRadius:10,padding:12,fontSize:13,color:C.sub,whiteSpace:'pre-wrap',fontFamily:font}}>{tournament.paymentDetails}</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
