import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'CANDIDATE' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roles: [formData.role]
      };
      await api.post('/api/auth/register', payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
    color: 'var(--text-dark)',
    background: '#fff',
    transition: 'border-color 200ms, box-shadow 200ms',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.85rem', fontWeight: 600,
    color: 'var(--text-dark)', marginBottom: '0.4rem',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #f0f5ff 0%, #fff 55%, #fff7f3 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem', fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        filter: 'blur(80px)', opacity: 0.3, pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(26,60,110,0.2), transparent 70%)',
        top: -80, right: -100,
      }} />
      <div style={{
        position: 'absolute', width: 350, height: 350, borderRadius: '50%',
        filter: 'blur(80px)', opacity: 0.25, pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(249,115,22,0.2), transparent 70%)',
        bottom: -60, left: -80,
      }} />

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none' }}>
        <div className="sidebar-logo-mark" style={{ width: 40, height: 40, fontSize: '1.1rem' }}>F</div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-dark)' }}>
          Fame<span style={{ color: 'var(--accent)' }}>hub</span>
        </span>
      </Link>

      {/* Card */}
      <div className="animate-fade-up" style={{
        width: '100%', maxWidth: '460px',
        background: '#fff', border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '2.5rem',
        boxShadow: 'var(--shadow-xl)', position: 'relative', zIndex: 10,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-lg)',
            background: 'var(--surface)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.6rem',
            border: '1.5px solid var(--border)',
          }}>🚀</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.4rem' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Join Famehub to discover your next opportunity
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: '1.25rem', padding: '0.75rem 1rem',
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 'var(--radius-md)', fontSize: '0.875rem',
            color: '#dc2626', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Full Name */}
          <div>
            <label style={labelStyle}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'var(--text-muted)' }}>
                👤
              </span>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'var(--text-muted)' }}>
                📧
              </span>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'var(--text-muted)' }}>
                🔒
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 8 characters"
                style={{ ...inputStyle, paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', minHeight: 'auto',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Role Select */}
          <div>
            <label style={labelStyle}>I am a</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'var(--text-muted)' }}>
                💼
              </span>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="CANDIDATE">Candidate looking for jobs</option>
                <option value="HR">HR / Recruiter</option>
              </select>
              <span style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                fontSize: '0.75rem', color: 'var(--text-muted)', pointerEvents: 'none'
              }}>▼</span>
            </div>
          </div>

          {/* Role info badges */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[
              { value: 'CANDIDATE', icon: '🎯', label: 'Job Seeker', desc: 'Browse & apply to jobs' },
              { value: 'HR', icon: '🏢', label: 'Recruiter', desc: 'Post jobs & hire talent' },
            ].map(opt => (
              <div
                key={opt.value}
                onClick={() => setFormData({ ...formData, role: opt.value })}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  border: `1.5px solid ${formData.role === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                  background: formData.role === opt.value ? 'rgba(26,60,110,0.05)' : '#fff',
                  transition: 'all 200ms ease',
                }}
              >
                <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{opt.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-dark)' }}>{opt.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary-th"
            style={{
              width: '100%', justifyContent: 'center', padding: '0.875rem',
              fontSize: '0.95rem', marginTop: '0.25rem',
              opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>

      {/* Back link */}
      <Link to="/" style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
        ← Back to Famehub
      </Link>
    </div>
  );
}
