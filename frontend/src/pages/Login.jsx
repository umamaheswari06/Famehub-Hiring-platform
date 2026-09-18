import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../utils/api';

/* ── Demo credentials shown on the card ─────────────────── */
const DEMO_ACCOUNTS = [
  { role: 'Admin',     email: 'admin@famehub.com',     password: 'adminpassword',     icon: '🛡️' },
  { role: 'Recruiter', email: 'hr@famehub.com',         password: 'hrpassword',         icon: '💼' },
  { role: 'Candidate', email: 'candidate@famehub.com',  password: 'candidatepassword',  icon: '🎯' },
];

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', formData);
      // Store both access + refresh tokens
      localStorage.setItem('accessToken', res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        roles: res.data.roles,
      }));
      // Navigate by role
      if (res.data.roles.includes('ROLE_ADMIN')) navigate('/admin/dashboard');
      else if (res.data.roles.includes('ROLE_HR')) navigate('/hr/dashboard');
      else navigate('/candidate/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Please make sure the backend is running on port 8080.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* Quick-fill a demo account */
  const fillDemo = (account) => {
    setFormData({ email: account.email, password: account.password });
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #f0f5ff 0%, #fff 55%, #fff7f3 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem', fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden',
    }}>
      {/* BG blobs */}
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', filter:'blur(80px)', opacity:0.28, pointerEvents:'none', background:'radial-gradient(circle, rgba(26,60,110,0.2), transparent 70%)', top:-120, right:-80 }} />
      <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', filter:'blur(80px)', opacity:0.22, pointerEvents:'none', background:'radial-gradient(circle, rgba(249,115,22,0.18), transparent 70%)', bottom:-80, left:-60 }} />

      {/* Logo */}
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'2rem', textDecoration:'none' }}>
        <div className="sidebar-logo-mark" style={{ width:40, height:40, fontSize:'1.1rem' }}>F</div>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:700, color:'var(--text-dark)' }}>
          Fame<span style={{ color:'var(--accent)' }}>hub</span>
        </span>
      </Link>

      <div style={{ width:'100%', maxWidth:'860px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', alignItems:'start', position:'relative', zIndex:10 }}
        className="grid-login">

        {/* ── Left: Login Card ─────────────────────────── */}
        <div className="animate-fade-up" style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'2.5rem', boxShadow:'var(--shadow-xl)' }}>
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <div style={{ width:56, height:56, borderRadius:'var(--radius-lg)', background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontSize:'1.6rem', border:'1.5px solid var(--border)' }}>🔐</div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700, color:'var(--text-dark)', marginBottom:'0.4rem' }}>Welcome back</h1>
            <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Sign in to your Famehub account</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom:'1.25rem', padding:'0.875rem 1rem', background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:'var(--radius-md)', fontSize:'0.85rem', color:'#dc2626', display:'flex', gap:'0.5rem', alignItems:'flex-start' }}>
              <AlertCircle size={16} style={{ flexShrink:0, marginTop:1 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:'var(--text-dark)', marginBottom:'0.4rem' }}>Email address</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', fontSize:'1rem', color:'var(--text-muted)' }}>📧</span>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  style={{ width:'100%', padding:'0.75rem 1rem 0.75rem 2.5rem', border:'1.5px solid var(--border)', borderRadius:'var(--radius-md)', fontSize:'0.9rem', color:'var(--text-dark)', background:'#fff' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.4rem' }}>
                <label style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-dark)' }}>Password</label>
                <a href="#" style={{ fontSize:'0.8rem', color:'var(--accent)', fontWeight:500 }}>Forgot password?</a>
              </div>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', fontSize:'1rem', color:'var(--text-muted)' }}>🔒</span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ width:'100%', padding:'0.75rem 2.5rem 0.75rem 2.5rem', border:'1.5px solid var(--border)', borderRadius:'var(--radius-md)', fontSize:'0.9rem', color:'var(--text-dark)', background:'#fff' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute', right:'0.875rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center' }}>
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary-th"
              style={{ width:'100%', justifyContent:'center', padding:'0.875rem', fontSize:'0.95rem', marginTop:'0.25rem', opacity:loading?0.75:1, cursor:loading?'not-allowed':'pointer' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin"/> : 'Sign In →'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:'1rem', margin:'1.5rem 0' }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
            <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:500 }}>or</span>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
          </div>

          <p style={{ textAlign:'center', fontSize:'0.875rem', color:'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Create one</Link>
          </p>
        </div>

        {/* ── Right: Demo Credentials ───────────────────── */}
        <div className="animate-fade-up-d2" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'1.75rem', boxShadow:'var(--shadow-md)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.25rem' }}>
              <span style={{ fontSize:'1.2rem' }}>🔑</span>
              <div>
                <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.95rem', color:'var(--text-dark)', margin:0 }}>Demo Accounts</h3>
                <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', margin:0 }}>Click any card to auto-fill credentials</p>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  onClick={() => fillDemo(account)}
                  style={{
                    width:'100%', textAlign:'left', padding:'0.875rem 1rem',
                    background: formData.email === account.email ? 'rgba(26,60,110,0.05)' : 'var(--off-white)',
                    border: `1.5px solid ${formData.email === account.email ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius:'var(--radius-md)', cursor:'pointer',
                    transition:'all 200ms ease', display:'flex', alignItems:'center', gap:'0.75rem',
                  }}
                >
                  <span style={{ fontSize:'1.4rem' }}>{account.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.88rem', color:'var(--text-dark)' }}>{account.role}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.1rem' }}>{account.email}</div>
                  </div>
                  <span style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--primary)', background:'var(--surface)', padding:'0.2rem 0.6rem', borderRadius:'20px' }}>
                    {formData.email === account.email ? '✓ Selected' : 'Use'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div style={{ background:'rgba(249,115,22,0.06)', border:'1.5px solid rgba(249,115,22,0.2)', borderRadius:'var(--radius-lg)', padding:'1rem 1.25rem', display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
            <span style={{ fontSize:'1.2rem', flexShrink:0 }}>💡</span>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.85rem', color:'var(--accent)', marginBottom:'0.3rem' }}>Heads up</div>
              <p style={{ fontSize:'0.8rem', color:'var(--text-body)', lineHeight:1.6, margin:0 }}>
                Make sure the <strong>Spring Boot backend</strong> is running on <code style={{ background:'var(--surface)', padding:'0.1rem 0.4rem', borderRadius:'4px', fontSize:'0.78rem' }}>localhost:8080</code> before signing in.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Link to="/" style={{ marginTop:'1.5rem', fontSize:'0.85rem', color:'var(--text-muted)', textDecoration:'none' }}>
        ← Back to Famehub
      </Link>

      {/* Responsive grid */}
      <style>{`
        @media (max-width: 680px) {
          .grid-login { grid-template-columns: 1fr !important; max-width: 440px !important; }
        }
      `}</style>
    </div>
  );
}
