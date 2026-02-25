import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#04080f',surface:'#0b1220',elevated:'#111c2e',border:'rgba(255,255,255,0.07)',brand:'#00d4ff',green:'#00e676',red:'#ff1744',text:'#f1f5f9',sub:'#64748b',muted:'#2d3f55' };
const sans = "'DM Sans','Segoe UI',system-ui,sans-serif";
const font = "'DM Mono','Fira Code',monospace";

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1=org details, 2=admin account
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    organizationName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    // Validation
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: form.organizationName,
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Auto login
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:sans,color:C.text,position:'relative',overflow:'hidden' }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      `}</style>

      {/* Background effects */}
      <div style={{ position:'fixed',inset:0,backgroundImage:'linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none' }}/>
      <div style={{ position:'fixed',top:'-20%',left:'50%',transform:'translateX(-50%)',width:600,height:600,background:'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 60%)',pointerEvents:'none',animation:'float 6s ease-in-out infinite' }}/>

      <div style={{ width:'100%',maxWidth:500,position:'relative',zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center',marginBottom:40 }}>
          <div style={{ width:80,height:80,background:C.brandDim,border:`2px solid ${C.brand}30`,borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,margin:'0 auto 20px',boxShadow:`0 0 30px ${C.brand}20` }}>🏸</div>
          <h1 style={{ fontFamily:font,fontSize:28,fontWeight:900,color:C.white,margin:0,letterSpacing:-1 }}>TOURNAMENT PRO</h1>
          <p style={{ color:C.sub,marginTop:8,fontSize:14 }}>Enterprise Badminton Management Platform</p>
        </div>

        {/* Progress indicator */}
        <div style={{ display:'flex',justifyContent:'center',gap:8,marginBottom:32 }}>
          {[1,2].map(s=>(
            <div key={s} style={{ width:s===step?60:40,height:4,background:s<=step?C.brand:C.border,borderRadius:4,transition:'all 0.3s' }}/>
          ))}
        </div>

        {/* Form Card */}
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:40,boxShadow:'0 40px 100px rgba(0,0,0,0.8)',animation:'fadeIn 0.4s ease' }}>
          <form onSubmit={step===1?e=>{e.preventDefault();setStep(2)}:handleSignup}>
            {/* STEP 1: Organization Details */}
            {step===1 && (
              <div style={{ animation:'fadeIn 0.3s ease' }}>
                <h2 style={{ fontSize:22,fontWeight:800,color:C.text,marginBottom:8 }}>Create Your Organization</h2>
                <p style={{ color:C.sub,fontSize:13,marginBottom:28 }}>Start your 14-day free trial — no credit card required</p>

                <div style={{ marginBottom:20 }}>
                  <label style={{ display:'block',color:C.sub,fontSize:12,marginBottom:6,fontWeight:600,letterSpacing:0.5 }}>Organization Name *</label>
                  <input required value={form.organizationName} onChange={e=>setForm({...form,organizationName:e.target.value})} placeholder="e.g., Chennai Badminton Association" style={{ width:'100%',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',color:C.text,fontSize:15,outline:'none',fontFamily:sans,boxSizing:'border-box' }}/>
                  <p style={{ color:C.muted,fontSize:11,marginTop:4 }}>This will be your organization's workspace</p>
                </div>

                <div style={{ background:C.elevated,borderRadius:12,padding:20,border:`1px solid ${C.border}`,marginBottom:24 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:12 }}>
                    <span style={{ fontSize:24 }}>🎁</span>
                    <div>
                      <div style={{ color:C.brand,fontSize:14,fontWeight:700 }}>Free Plan Includes</div>
                      <div style={{ color:C.sub,fontSize:12 }}>Perfect for getting started</div>
                    </div>
                  </div>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:12 }}>
                    {['2 Tournaments','5 Team Members','1 GB Storage','Live Scoring','Public Registration','Email Support'].map(f=>(
                      <div key={f} style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,color:C.sub }}>
                        <span style={{ color:C.green }}>✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" style={{ width:'100%',padding:'14px',background:C.brand,color:C.bg,border:'none',borderRadius:10,cursor:'pointer',fontWeight:800,fontSize:15,fontFamily:sans,boxShadow:`0 0 20px ${C.brand}40` }}>
                  Continue →
                </button>
              </div>
            )}

            {/* STEP 2: Admin Account */}
            {step===2 && (
              <div style={{ animation:'fadeIn 0.3s ease' }}>
                <button type="button" onClick={()=>setStep(1)} style={{ background:'none',border:'none',color:C.sub,cursor:'pointer',fontSize:13,marginBottom:16,display:'flex',alignItems:'center',gap:4,padding:0 }}>
                  ← Back
                </button>

                <h2 style={{ fontSize:22,fontWeight:800,color:C.text,marginBottom:8 }}>Create Admin Account</h2>
                <p style={{ color:C.sub,fontSize:13,marginBottom:24 }}>You'll be the organization administrator</p>

                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block',color:C.sub,fontSize:12,marginBottom:6,fontWeight:600 }}>Full Name *</label>
                  <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="John Smith" style={{ width:'100%',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',color:C.text,fontSize:14,outline:'none',fontFamily:sans,boxSizing:'border-box' }}/>
                </div>

                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block',color:C.sub,fontSize:12,marginBottom:6,fontWeight:600 }}>Email Address *</label>
                  <input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="admin@example.com" style={{ width:'100%',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',color:C.text,fontSize:14,outline:'none',fontFamily:sans,boxSizing:'border-box' }}/>
                </div>

                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block',color:C.sub,fontSize:12,marginBottom:6,fontWeight:600 }}>Phone (Optional)</label>
                  <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91 98765 43210" style={{ width:'100%',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',color:C.text,fontSize:14,outline:'none',fontFamily:sans,boxSizing:'border-box' }}/>
                </div>

                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block',color:C.sub,fontSize:12,marginBottom:6,fontWeight:600 }}>Password *</label>
                  <input required type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Minimum 6 characters" style={{ width:'100%',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',color:C.text,fontSize:14,outline:'none',fontFamily:sans,boxSizing:'border-box' }}/>
                </div>

                <div style={{ marginBottom:24 }}>
                  <label style={{ display:'block',color:C.sub,fontSize:12,marginBottom:6,fontWeight:600 }}>Confirm Password *</label>
                  <input required type="password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} placeholder="Re-enter password" style={{ width:'100%',background:C.elevated,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',color:C.text,fontSize:14,outline:'none',fontFamily:sans,boxSizing:'border-box' }}/>
                </div>

                {error && (
                  <div style={{ background:'rgba(255,23,68,0.1)',border:`1px solid ${C.red}40`,color:'#ffa0b0',padding:'10px 14px',borderRadius:8,marginBottom:16,fontSize:13 }}>
                    ⚠ {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{ width:'100%',padding:'14px',background:loading?C.muted:C.green,color:'#fff',border:'none',borderRadius:10,cursor:loading?'not-allowed':'pointer',fontWeight:800,fontSize:15,fontFamily:sans,boxShadow:loading?'none':`0 0 20px ${C.green}40` }}>
                  {loading?'⏳ Creating Organization...':'🚀 Create Organization'}
                </button>

                <p style={{ color:C.muted,fontSize:11,marginTop:16,textAlign:'center',lineHeight:1.6 }}>
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Login link */}
        <div style={{ textAlign:'center',marginTop:20 }}>
          <Link to="/login" style={{ color:C.sub,fontSize:14,textDecoration:'none' }}>
            Already have an account? <span style={{ color:C.brand,fontWeight:600 }}>Login →</span>
          </Link>
        </div>

        {/* Features */}
        <div style={{ marginTop:40,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
          {[
            {icon:'🏢',title:'Multi-Tenant SaaS',desc:'Each org has isolated data'},
            {icon:'👥',title:'Role-Based Access',desc:'6 roles with permissions'},
            {icon:'⚙️',title:'Full Customization',desc:'Every tournament parameter'},
            {icon:'🏸',title:'BWF Scoring',desc:'Professional umpire portal'},
          ].map(f=>(
            <div key={f.title} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:16,textAlign:'center' }}>
              <div style={{ fontSize:28,marginBottom:8 }}>{f.icon}</div>
              <div style={{ color:C.text,fontSize:13,fontWeight:700,marginBottom:2 }}>{f.title}</div>
              <div style={{ color:C.muted,fontSize:11 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
