import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#04080f',surface:'#0b1220',elevated:'#111c2e',border:'rgba(255,255,255,0.07)',brand:'#00d4ff',green:'#00e676',red:'#ff1744',text:'#f1f5f9',sub:'#64748b',muted:'#2d3f55' };
const sans = "'DM Sans','Segoe UI',system-ui,sans-serif";
const font = "'DM Mono','Fira Code',monospace";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

 const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await login(email, password); // use AuthContext properly
    navigate('/dashboard');
  } catch (err) {
    setError(err.response?.data?.error || 'Login failed');
  }

  setLoading(false);
};
  return (
    <div style={{ minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:sans,color:C.text,position:'relative',overflow:'hidden' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      
      {/* Background */}
      <div style={{ position:'fixed',inset:0,backgroundImage:'linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none' }}/>
      <div style={{ position:'fixed',top:'-20%',left:'50%',transform:'translateX(-50%)',width:600,height:600,background:'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 60%)',pointerEvents:'none' }}/>

      <div style={{ width:'100%',maxWidth:440,position:'relative',zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center',marginBottom:40 }}>
          <div style={{ width:80,height:80,background:`rgba(0,212,255,0.1)`,border:`2px solid ${C.brand}30`,borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,margin:'0 auto 20px',boxShadow:`0 0 30px ${C.brand}20` }}>🏸</div>
          <h1 style={{ fontFamily:font,fontSize:28,fontWeight:900,color:C.white,margin:0,letterSpacing:-1 }}>TOURNAMENT PRO</h1>
          <p style={{ color:C.sub,marginTop:8,fontSize:14 }}>Sign in to your organization</p>
        </div>

        {/* Card */}
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:40,boxShadow:'0 40px 100px rgba(0,0,0,0.8)',animation:'fadeIn 0.4s ease' }}>
          <form onSubmit={handleLogin}>
            {error && (
              <div style={{ background:'rgba(255,23,68,0.1)',border:`1px solid ${C.red}40`,color:'#ffa0b0',padding:'12px 16px',borderRadius:10,marginBottom:20,fontSize:13,fontWeight:600 }}>
                ⚠ {error}
              </div>
            )}
            
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block',color:C.sub,fontSize:12,marginBottom:6,fontWeight:600,letterSpacing:0.5 }}>Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="admin@example.com" style={{ width:'100%',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',color:C.text,fontSize:15,outline:'none',fontFamily:sans,boxSizing:'border-box' }}/>
            </div>
            
            <div style={{ marginBottom:8 }}>
              <label style={{ display:'block',color:C.sub,fontSize:12,marginBottom:6,fontWeight:600,letterSpacing:0.5 }}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Enter your password" style={{ width:'100%',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',color:C.text,fontSize:15,outline:'none',fontFamily:sans,boxSizing:'border-box' }}/>
            </div>

            <div style={{ textAlign:'right',marginBottom:24 }}>
              <Link to="/forgot-password" style={{ color:C.brand,fontSize:12,textDecoration:'none',fontWeight:600 }}>Forgot password?</Link>
            </div>
            
            <button type="submit" disabled={loading} style={{ width:'100%',padding:'14px',background:loading?C.muted:C.brand,color:loading?C.sub:C.bg,border:'none',borderRadius:10,cursor:loading?'not-allowed':'pointer',fontWeight:800,fontSize:15,fontFamily:sans,boxShadow:loading?'none':`0 0 20px ${C.brand}40`,transition:'all 0.2s' }}>
              {loading?'⏳ Signing in...':'Sign In →'}
            </button>
          </form>
        </div>

        {/* Signup link */}
        <div style={{ textAlign:'center',marginTop:24 }}>
          <p style={{ color:C.sub,fontSize:14 }}>
            Don't have an account? <Link to="/signup" style={{ color:C.brand,textDecoration:'none',fontWeight:700 }}>Create Organization →</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20,marginTop:24 }}>
          <div style={{ color:C.sub,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:2,marginBottom:12 }}>Demo Credentials</div>
          <div style={{ display:'grid',gap:8,fontSize:12,fontFamily:font }}>
            {[
              ['admin@cbachennai.in','admin123','Org Admin'],
              ['organizer@cbachennai.in','organizer123','Organizer'],
              ['umpire@cbachennai.in','umpire123','Umpire'],
            ].map(([e,p,r])=>(
              <div key={e} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:8,background:C.elevated,borderRadius:6 }}>
                <div>
                  <div style={{ color:C.text,fontWeight:600 }}>{e}</div>
                  <div style={{ color:C.muted,fontSize:11 }}>{p} · {r}</div>
                </div>
                <button type="button" onClick={()=>{setEmail(e);setPassword(p);}} style={{ padding:'4px 10px',background:`rgba(0,212,255,0.1)`,color:C.brand,border:`1px solid ${C.brand}30`,borderRadius:6,cursor:'pointer',fontSize:10,fontWeight:700 }}>Use</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
