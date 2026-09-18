import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/* ══════════════════════════════════════════════════════════
   PRELOADER
   ══════════════════════════════════════════════════════════ */
const Preloader = ({ hidden }) => (
  <div className={`preloader${hidden ? ' hidden' : ''}`} role="status" aria-label="Loading">
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div className="preloader-logo-mark animate-logo-pulse">F</div>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
        Famehub
      </span>
    </div>
    <div className="preloader-spinner" />
  </div>
);

/* ══════════════════════════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════════════════════════ */
const Navbar = ({ onLoginClick, onRegisterClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'categories', label: 'Categories' },
    { id: 'companies', label: 'Companies' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(`th-${id}`);
    if (el) {
      const offset = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
    setActiveLink(id);
    setMobileOpen(false);
  };

  return (
    <header className={`th-header${scrolled ? ' scrolled' : ''}`}>
      <div style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Logo */}
          <a href="#th-home" onClick={(e) => { e.preventDefault(); scrollTo('home'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div className="sidebar-logo-mark" style={{ width: '38px', height: '38px', fontSize: '1.1rem' }}>F</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)' }}>
              Fame<span style={{ color: 'var(--accent)' }}>hub</span>
            </span>
          </a>

          {/* Desktop nav links */}
          <ul style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', listStyle: 'none', margin: 0, padding: 0 }}
            className="hidden lg:flex">
            {navLinks.map(link => (
              <li key={link.id}>
                <button onClick={() => scrollTo(link.id)}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 500,
                    color: activeLink === link.id ? 'var(--primary)' : 'var(--text-body)',
                    padding: '0.5rem 0.75rem', borderRadius: '0.75rem', background: 'none', border: 'none',
                    cursor: 'pointer', transition: 'color 150ms ease', position: 'relative',
                  }}>
                  {link.label}
                  {activeLink === link.id && (
                    <span style={{
                      position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                      width: 20, height: 2, background: 'var(--accent)', borderRadius: 2, display: 'block'
                    }} />
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden lg:flex">
            <button className="btn btn-outline-th" onClick={onLoginClick}>Browse Jobs</button>
            <button className="btn btn-primary-th" onClick={onRegisterClick}>Post a Job</button>
          </div>

          {/* Hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden"
            aria-label="Toggle menu"
            style={{
              display: 'flex', flexDirection: 'column', gap: '5px', padding: '0.5rem',
              background: 'none', border: 'none', cursor: 'pointer'
            }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', width: '24px', height: '2px', background: 'var(--text-dark)',
                borderRadius: '2px', transition: 'transform 280ms, opacity 280ms',
                transform: mobileOpen
                  ? i === 0 ? 'translateY(7px) rotate(45deg)' : i === 2 ? 'translateY(-7px) rotate(-45deg)' : 'none'
                  : 'none',
                opacity: mobileOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </nav>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav style={{
          position: 'fixed', top: '76px', left: 0, right: 0,
          background: '#fff', borderBottom: '1px solid var(--border)',
          padding: '1rem 1.5rem', boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 999,
        }}>
          {navLinks.map(link => (
            <button key={link.id} onClick={() => scrollTo(link.id)}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 500,
                color: 'var(--text-body)', padding: '0.75rem 0.5rem',
                borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                borderBottom: '1px solid var(--border)', background: 'none',
                textAlign: 'left', cursor: 'pointer',
                transition: 'color 150ms ease',
              }}>
              {link.label}
            </button>
          ))}
          <button className="btn btn-primary-th" onClick={onRegisterClick} style={{ marginTop: '0.75rem' }}>
            Post a Job
          </button>
        </nav>
      )}
    </header>
  );
};

/* ══════════════════════════════════════════════════════════
   JOB CATEGORIES DATA
   ══════════════════════════════════════════════════════════ */
const CATEGORIES = [
  { icon: '💻', name: 'Technology', count: '8,420 jobs', color: '#dbeafe' },
  { icon: '🎨', name: 'Design & Creative', count: '3,815 jobs', color: '#f3e8ff' },
  { icon: '📊', name: 'Marketing', count: '5,230 jobs', color: '#ffedd5' },
  { icon: '💰', name: 'Finance', count: '4,102 jobs', color: '#dcfce7' },
  { icon: '⚕️', name: 'Healthcare', count: '6,750 jobs', color: '#fee2e2' },
  { icon: '📚', name: 'Education', count: '2,945 jobs', color: '#ccfbf1' },
  { icon: '⚙️', name: 'Engineering', count: '7,380 jobs', color: '#fef9c3' },
  { icon: '🤝', name: 'Sales & CRM', count: '4,620 jobs', color: '#fce7f3' },
  { icon: '🎬', name: 'Content Creator', count: '620 jobs', color: '#fee2e2' },
  { icon: '🤖', name: 'AI', count: '9,620 jobs', color: '#fce7f3' },
];

/* ══════════════════════════════════════════════════════════
   FEATURED JOBS DATA
   ══════════════════════════════════════════════════════════ */
const JOBS = [
  { title: 'Senior Frontend Engineer', company: 'Stripe Inc.', logo: '💳', location: 'San Francisco, CA', posted: '3 days ago', type: 'Full Time', typeColor: 'badge-green-th', tags: ['React', 'TypeScript'], salary: '$140K–$180K', tagType: 'Full Time' },
  { title: 'Product Design Lead', company: 'Airbnb', logo: '🏠', location: 'Remote (Global)', posted: '1 day ago', type: 'Remote', typeColor: 'badge-purple-th', tags: ['Figma', 'UX Research'], salary: '$120K–$155K', tagType: 'Remote' },
  { title: 'Data Science Manager', company: 'Netflix', logo: '🎬', location: 'Los Angeles, CA', posted: '5 days ago', type: 'Full Time', typeColor: 'badge-green-th', tags: ['Python', 'ML'], salary: '$160K–$220K', tagType: 'Full Time' },
  { title: 'DevOps Engineer', company: 'Shopify', logo: '🛒', location: 'Toronto, Canada', posted: '2 days ago', type: 'Full Time', typeColor: 'badge-green-th', tags: ['Kubernetes', 'AWS'], salary: '$115K–$145K', tagType: 'Full Time' },
  { title: 'Marketing Strategist', company: 'HubSpot', logo: '🎯', location: 'Boston, MA / Remote', posted: 'Today', type: 'Hybrid', typeColor: 'badge-purple-th', tags: ['SEO', 'Analytics'], salary: '$80K–$105K', tagType: 'Part Time' },
  { title: 'Backend Engineer (Go)', company: 'Notion', logo: '📝', location: 'New York, NY', posted: '4 days ago', type: 'Full Time', typeColor: 'badge-green-th', tags: ['Go', 'PostgreSQL'], salary: '$130K–$170K', tagType: 'Full Time' },
];

/* ══════════════════════════════════════════════════════════
   TOP COMPANIES DATA
   ══════════════════════════════════════════════════════════ */
const COMPANIES = [
  { logo: '🍎', name: 'Apple', roles: '320 open roles' },
  { logo: '🔍', name: 'Google', roles: '580 open roles' },
  { logo: '📦', name: 'Amazon', roles: '1,200 open roles' },
  { logo: '🪟', name: 'Microsoft', roles: '870 open roles' },
  { logo: '🚗', name: 'Tesla', roles: '415 open roles' },
  { logo: '💼', name: 'LinkedIn', roles: '220 open roles' },
];

/* ══════════════════════════════════════════════════════════
   TESTIMONIALS DATA
   ══════════════════════════════════════════════════════════ */
const TESTIMONIALS = [
  { text: "I'd been searching for months with no luck. Famehub's AI matching sent me a role I'd never have found on my own — I started at Stripe two weeks later. Incredible platform.", name: 'James Moretti', role: 'Senior Engineer · Stripe', initials: 'JM', avatarClass: 'av-blue' },
  { text: "As a recruiter, Famehub saves our team hours every week. The quality of candidates is significantly higher than any other platform we've used. Our time-to-hire dropped by 40%.", name: 'Sarah Lim', role: 'Head of Talent · Notion', initials: 'SL', avatarClass: 'av-green' },
  { text: "Switched careers from finance to UX design. Famehub's filter system helped me target junior design roles specifically, and their application tracker made the whole process stress-free.", name: 'Aria Patel', role: 'UX Designer · Figma', initials: 'AP', avatarClass: 'av-orange' },
  { text: "Posted our first job listing expecting a week to fill it. Within 48 hours we had 60 qualified applicants. The pre-screening is unmatched. Famehub is now our go-to platform.", name: 'David Kim', role: 'CTO · Series B Startup', initials: 'DK', avatarClass: 'av-purple' },
  { text: "The remote job filter is the best I've seen. Granular, accurate, and up-to-date. Found a fully remote role with a 60% salary bump. Could not recommend this platform more.", name: 'Maya Rivera', role: 'Product Manager · Remote', initials: 'MR', avatarClass: 'av-teal' },
  { text: "As a recent grad, I felt intimidated by the job market. Famehub's entry-level filter and salary transparency gave me confidence to apply — and land — my first tech role.", name: 'Tom Chen', role: 'Software Engineer · HubSpot', initials: 'TC', avatarClass: 'av-blue' },
];

/* ══════════════════════════════════════════════════════════
   ANIMATED COUNTER HOOK
   ══════════════════════════════════════════════════════════ */
function useCountUp(target, suffix, duration = 1800, isFloat = false, trigger = false) {
  const [value, setValue] = useState('0' + suffix);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      setValue(isFloat ? start.toFixed(1) + suffix : Math.floor(start).toLocaleString() + suffix);
    }, 16);
    return () => clearInterval(timer);
  }, [trigger]);
  return value;
}

/* ══════════════════════════════════════════════════════════
   INTERSECTION OBSERVER HOOK
   ══════════════════════════════════════════════════════════ */
function useVisible(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

/* ══════════════════════════════════════════════════════════
   HERO STATS
   ══════════════════════════════════════════════════════════ */
const HeroStats = () => {
  const [ref, visible] = useVisible(0.4);
  const s1 = useCountUp(48, 'K+', 1800, false, visible);
  const s2 = useCountUp(12, 'K+', 1800, false, visible);
  const s3 = useCountUp(2.3, 'M+', 1800, true, visible);
  const s4 = useCountUp(98, '%', 1800, false, visible);
  const stats = [
    { value: s1, label: 'Active Jobs' },
    { value: s2, label: 'Companies' },
    { value: s3, label: 'Job Seekers' },
    { value: s4, label: 'Success Rate' },
  ];
  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
      {stats.map((stat, i) => (
        <React.Fragment key={stat.label}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {stat.label}
            </div>
          </div>
          {i < stats.length - 1 && (
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SCROLL REVEAL WRAPPER
   ══════════════════════════════════════════════════════════ */
const Reveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const [ref, visible] = useVisible(0.1);
  const animations = {
    up: 'animate-fade-up',
    right: 'animate-slide-right',
    left: 'animate-slide-left',
    zoom: 'animate-zoom-in',
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? undefined : 0,
        animation: visible ? `${animations[direction]} 0.65s ${delay}s cubic-bezier(0.22,1,0.36,1) both` : 'none',
      }}
    >
      {children}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN WELCOME COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function Welcome() {
  const navigate = useNavigate();
  const [preloaderHidden, setPreloaderHidden] = useState(false);
  const [activeTab, setActiveTab] = useState('All Jobs');
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState('idle'); // idle | sending | sent

  // Search state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setPreloaderHidden(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollTopVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const JOB_TABS = ['All Jobs', 'Full Time', 'Part Time', 'Remote', 'Internship'];

  const filteredJobs = activeTab === 'All Jobs'
    ? JOBS
    : JOBS.filter(j => j.tagType === activeTab);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactStatus('sending');
    setTimeout(() => {
      setContactStatus('sent');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setContactStatus('idle'), 3000);
    }, 1500);
  };

  const handleSearch = () => {
    navigate('/login');
  };

  return (
    <>
      <Preloader hidden={preloaderHidden} />

      <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text-body)', background: 'var(--off-white)' }}>
        <Navbar
          onLoginClick={() => navigate('/login')}
          onRegisterClick={() => navigate('/register')}
        />

        {/* ═══════════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════════ */}
        <section id="th-home" style={{
          minHeight: '100vh', paddingTop: 'calc(76px + 3rem)', paddingBottom: '5rem',
          background: 'linear-gradient(150deg, #f0f5ff 0%, #fff 55%, #fff7f3 100%)',
          position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center',
        }}>
          {/* Blobs */}
          <div className="hero-blob-th" style={{ width: 520, height: 520, background: 'radial-gradient(circle, rgba(26,60,110,0.18), transparent 70%)', top: -120, right: -80 }} />
          <div className="hero-blob-th" style={{ width: 380, height: 380, background: 'radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%)', bottom: -60, left: -60 }} />
          <div className="dots-grid-th" />

          <div style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>

              <Reveal delay={0}>
                <div className="hero-tag-th" style={{ marginBottom: '1.5rem' }}>
                  <span>✦</span> #1 AI Hiring Platform 2025
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <h1 className="hero-title-th" style={{ marginBottom: '1.5rem' }}>
                  Find Your <em>Dream Job</em><br />Today
                </h1>
              </Reveal>

              <Reveal delay={0.2}>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 2.5rem' }}>
                  Discover thousands of opportunities from top companies across every industry. Your next chapter starts here.
                </p>
              </Reveal>

              {/* Search Box */}
              <Reveal delay={0.3}>
                <div className="search-box-th" style={{ marginBottom: '1rem' }}>
                  <div className="search-field-th">
                    <span style={{ fontSize: '1.1rem' }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Job title or keyword"
                      value={searchKeyword}
                      onChange={e => setSearchKeyword(e.target.value)}
                      aria-label="Job title or keyword"
                    />
                  </div>
                  <div className="search-field-th">
                    <span style={{ fontSize: '1.1rem' }}>📍</span>
                    <input
                      type="text"
                      placeholder="City or remote"
                      value={searchLocation}
                      onChange={e => setSearchLocation(e.target.value)}
                      aria-label="Location"
                    />
                  </div>
                  <div className="search-field-th">
                    <span style={{ fontSize: '1.1rem' }}>📂</span>
                    <select value={searchCategory} onChange={e => setSearchCategory(e.target.value)} aria-label="Category">
                      <option value="">All Categories</option>
                      <option>Technology</option>
                      <option>Design & Creative</option>
                      <option>Marketing</option>
                      <option>Finance</option>
                      <option>Healthcare</option>
                      <option>Education</option>
                      <option>Engineering</option>
                      <option>Sales</option>
                    </select>
                  </div>
                  <button className="search-btn-th" onClick={handleSearch}>
                    <span>Search Jobs</span>
                    <span>→</span>
                  </button>
                </div>
              </Reveal>

              <HeroStats />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            JOB CATEGORIES
            ═══════════════════════════════════════════ */}
        <section id="th-categories" style={{ padding: '6rem 0', background: '#fff' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Reveal><div className="section-label-th">Explore Fields</div></Reveal>
              <Reveal delay={0.05}><h2 className="section-title-th">Browse by Category</h2></Reveal>
              <Reveal delay={0.1}><p className="section-subtitle-th">Find the perfect role in your area of expertise. New jobs added daily.</p></Reveal>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {CATEGORIES.map((cat, i) => (
                <Reveal key={cat.name} delay={i * 0.06} direction="zoom">
                  <div className="category-card-th" onClick={() => navigate('/login')}>
                    <div style={{
                      width: 60, height: 60, borderRadius: 'var(--radius-md)',
                      background: cat.color, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.6rem',
                      transition: 'transform 280ms ease',
                    }}>
                      {cat.icon}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {cat.count}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FEATURED JOBS
            ═══════════════════════════════════════════ */}
        <section id="th-jobs" style={{ padding: '6rem 0', background: 'var(--off-white)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Reveal><div className="section-label-th">Hot Opportunities</div></Reveal>
              <Reveal delay={0.05}><h2 className="section-title-th">Featured Jobs</h2></Reveal>
              <Reveal delay={0.1}><p className="section-subtitle-th">Handpicked roles from leading companies. Apply today before they're gone.</p></Reveal>
            </div>

            {/* Filter Tabs */}
            <Reveal delay={0.15}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {JOB_TABS.map(tab => (
                  <button key={tab} className={`tab-btn-th${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab}
                  </button>
                ))}
              </div>
            </Reveal>

            {/* Jobs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {(filteredJobs.length > 0 ? filteredJobs : JOBS).map((job, i) => (
                <Reveal key={`${job.title}-${i}`} delay={i * 0.08}>
                  <article className="job-card-th">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                          {job.title}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{job.company}</div>
                      </div>
                      <div style={{
                        width: 52, height: 52, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                        flexShrink: 0, background: 'var(--off-white)'
                      }}>
                        {job.logo}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        📍 {job.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        🕐 {job.posted}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      <span className={`badge-th ${job.typeColor}`}>{job.type}</span>
                      {job.tags.map(tag => (
                        <span key={tag} className="badge-th badge-blue-th">{tag}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-dark)', fontSize: '1rem' }}>
                          {job.salary}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / year</span>
                      </div>
                      <button className="btn btn-primary-th" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
                        onClick={() => navigate('/login')}>
                        Apply Now
                      </button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div style={{ textAlign: 'center' }}>
                <button className="btn btn-primary-th" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }} onClick={() => navigate('/login')}>
                  View All 48,000+ Jobs →
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            TOP COMPANIES
            ═══════════════════════════════════════════ */}
        <section id="th-companies" style={{ padding: '6rem 0', background: '#fff' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Reveal><div className="section-label-th">Trusted Partners</div></Reveal>
              <Reveal delay={0.05}><h2 className="section-title-th">Top Hiring Companies</h2></Reveal>
              <Reveal delay={0.1}><p className="section-subtitle-th">Join thousands of professionals working at world-class organizations.</p></Reveal>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {COMPANIES.map((company, i) => (
                <Reveal key={company.name} delay={i * 0.06}>
                  <div className="category-card-th" onClick={() => navigate('/login')} style={{ padding: '1.5rem 1rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{company.logo}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
                      {company.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>{company.roles}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            HOW IT WORKS
            ═══════════════════════════════════════════ */}
        <section id="th-how-it-works" style={{ padding: '6rem 0', background: 'var(--off-white)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Reveal><div className="section-label-th">Simple Process</div></Reveal>
              <Reveal delay={0.05}><h2 className="section-title-th">How Famehub Works</h2></Reveal>
              <Reveal delay={0.1}><p className="section-subtitle-th">Your path from job seeker to hired — in four simple steps.</p></Reveal>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[
                { num: '01', icon: '👤', title: 'Create Your Account', desc: 'Sign up in under 2 minutes. Build a professional profile that showcases your skills, experience, and aspirations.' },
                { num: '02', icon: '🔎', title: 'Search Jobs', desc: 'Use smart filters to find roles that match your skills, location preferences, and salary expectations.' },
                { num: '03', icon: '📋', title: 'Apply with Ease', desc: 'One-click apply using your saved profile. Track all applications from your personal dashboard in real time.' },
                { num: '04', icon: '🎉', title: 'Get Hired', desc: 'Receive interview invitations, negotiate offers, and land the job you\'ve always wanted — faster than ever.' },
              ].map((step, i) => (
                <Reveal key={step.num} delay={i * 0.1}>
                  <div style={{
                    background: '#fff', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
                    padding: '2rem', transition: 'transform 280ms ease, box-shadow 280ms ease',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800,
                      color: 'var(--border)', marginBottom: '0.75rem', lineHeight: 1,
                    }}>{step.num}</div>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{step.icon}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                      {step.title}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            ABOUT SECTION
            ═══════════════════════════════════════════ */}
        <section id="th-about" style={{ padding: '6rem 0', background: '#fff' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}
              className="grid-cols-1 lg:grid-cols-2">
              {/* Visual */}
              <Reveal direction="right">
                <div className="about-card-main-th">
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                    Connecting Talent with Opportunity
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Since 2019, Famehub has helped millions of professionals find their perfect role.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {[
                      { num: '5M+', label: 'Users' },
                      { num: '190+', label: 'Countries' },
                      { num: '12K+', label: 'Partners' },
                      { num: '4.9★', label: 'App Rating' },
                    ].map(stat => (
                      <div key={stat.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>{stat.num}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Content */}
              <Reveal direction="left">
                <div>
                  <div className="section-label-th" style={{ display: 'inline-flex' }}>Why Famehub</div>
                  <h2 className="section-title-th" style={{ textAlign: 'left', marginTop: '0.75rem' }}>The Smarter Way to Hire & Get Hired</h2>
                  <p className="section-subtitle-th" style={{ textAlign: 'left', marginInline: 0, marginBottom: '2rem' }}>
                    We combine AI-powered matching, verified company profiles, and a seamless application experience to eliminate the friction from hiring.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[
                      { icon: '🤖', title: 'AI-Powered Matching', desc: 'Our algorithm analyzes 50+ data points to surface jobs that genuinely fit your profile, not just keyword matches.' },
                      { icon: '✅', title: 'Verified Companies Only', desc: 'Every employer on Famehub is verified. No ghost listings, no scams — only real opportunities from real companies.' },
                      { icon: '⚡', title: 'Lightning-Fast Apply', desc: 'Apply to dozens of jobs in minutes with our one-click apply system powered by your saved profile and resume.' },
                    ].map(feat => (
                      <div key={feat.title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 'var(--radius-md)',
                          background: 'var(--surface)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
                        }}>{feat.icon}</div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{feat.title}</div>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{feat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <button className="btn btn-primary-th" onClick={() => navigate('/login')}>Explore Jobs →</button>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            TESTIMONIALS
            ═══════════════════════════════════════════ */}
        <section id="th-testimonials" style={{ padding: '6rem 0', background: 'var(--off-white)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Reveal><div className="section-label-th">Success Stories</div></Reveal>
              <Reveal delay={0.05}><h2 className="section-title-th">What Our Users Say</h2></Reveal>
              <Reveal delay={0.1}><p className="section-subtitle-th">Real people, real results. Here's how Famehub changed their careers.</p></Reveal>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.07}>
                  <article className="testimonial-card-th">
                    <div className="quote-icon-th">"</div>
                    <div style={{ color: '#f97316', fontSize: '0.9rem', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>★★★★★</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.7, marginBottom: '1.5rem' }}>"{t.text}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={t.avatarClass} style={{
                        width: 40, height: 40, borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                      }}>{t.initials}</div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)' }}>{t.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.role}</div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            CTA SECTION
            ═══════════════════════════════════════════ */}
        <section id="th-cta" style={{ padding: '4rem 0', background: '#fff' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
            <Reveal direction="zoom">
              <div className="cta-inner-th">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
                  Ready to Take the Next Step?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto 2rem' }}>
                  Whether you're looking to hire top talent or land your dream role — Famehub makes it happen. Join 5 million professionals today.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-accent-th" style={{ position: 'relative', zIndex: 1 }} onClick={() => navigate('/login')}>
                    Browse All Jobs
                  </button>
                  <button className="btn btn-outline-white-th" style={{ position: 'relative', zIndex: 1 }} onClick={() => navigate('/register')}>
                    Post a Job
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            CONTACT SECTION
            ═══════════════════════════════════════════ */}
        <section id="th-contact" style={{ padding: '6rem 0', background: 'var(--off-white)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Reveal><div className="section-label-th">Get in Touch</div></Reveal>
              <Reveal delay={0.05}><h2 className="section-title-th">Contact Us</h2></Reveal>
              <Reveal delay={0.1}><p className="section-subtitle-th">Have questions or want to post a job? Our team is here to help you succeed.</p></Reveal>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}
              className="grid-cols-1 lg:grid-cols-2">
              {/* Info */}
              <Reveal direction="right">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '1rem' }}>
                    Let's start a conversation
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                    Whether you're a job seeker with questions, an employer looking to hire, or a partner wanting to collaborate — we'd love to hear from you.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[
                      { icon: '📧', label: 'Email', value: 'hello@famehub.io' },
                      { icon: '📞', label: 'Phone', value: '+1 (800) 555-0198' },
                      { icon: '📍', label: 'Office', value: '340 Pine St, San Francisco, CA 94104' },
                      { icon: '⏰', label: 'Hours', value: 'Mon–Fri, 9AM–6PM PST' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--surface)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
                        }}>{item.icon}</div>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Form */}
              <Reveal direction="left">
                <form className="contact-form-th" onSubmit={handleContactSubmit}
                  style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Your Name</label>
                      <input type="text" placeholder="John Doe" required value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" placeholder="john@example.com" required value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input type="text" placeholder="How can we help?" value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea placeholder="Tell us more about your enquiry..." required value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary-th"
                    disabled={contactStatus === 'sending' || contactStatus === 'sent'}
                    style={{
                      width: '100%', justifyContent: 'center', padding: '1rem',
                      background: contactStatus === 'sent' ? '#16a34a' : undefined,
                      opacity: contactStatus === 'sending' ? 0.75 : 1,
                      cursor: contactStatus === 'sending' ? 'not-allowed' : 'pointer',
                    }}>
                    {contactStatus === 'idle' && 'Send Message →'}
                    {contactStatus === 'sending' && 'Sending…'}
                    {contactStatus === 'sent' && '✓ Message Sent!'}
                  </button>
                </form>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FOOTER
            ═══════════════════════════════════════════ */}
        <footer className="th-footer">
          <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '4rem 1.5rem 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2.5rem', marginBottom: '3rem' }}
              className="grid-cols-1 md:grid-cols-4">
              {/* Brand */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div className="sidebar-logo-mark">F</div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                    Fame<span style={{ color: 'var(--accent)' }}>hub</span>
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '260px' }}>
                  Connecting ambitious professionals with world-class companies. Your career journey starts here.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['𝕏', 'in', 'f', '◉'].map(s => (
                    <a key={s} href="#" className="social-link-th">{s}</a>
                  ))}
                </div>
              </div>

              {/* For Job Seekers */}
              <div>
                <h3 className="footer-col-title-th">For Job Seekers</h3>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                  {['Browse Jobs', 'Job Categories', 'Career Advice', 'Resume Builder', 'Salary Guide'].map(link => (
                    <li key={link}><a href="#" className="footer-link-th">{link}</a></li>
                  ))}
                </ul>
              </div>

              {/* For Employers */}
              <div>
                <h3 className="footer-col-title-th">For Employers</h3>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                  {['Post a Job', 'Talent Search', 'Pricing Plans', 'Employer Branding', 'Recruitment API'].map(link => (
                    <li key={link}><a href="#" className="footer-link-th">{link}</a></li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="footer-col-title-th">Company</h3>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                  <li><a href="#" className="footer-link-th">About Us</a></li>
                  <li><Link to="/login" className="footer-link-th">Login</Link></li>
                  <li><Link to="/register" className="footer-link-th">Register</Link></li>
                  <li><a href="#" className="footer-link-th">Contact</a></li>
                  <li><a href="#" className="footer-link-th">Blog</a></li>
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: '1.5rem' }} />

            {/* Bottom bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
                © {new Date().getFullYear()} <a href="#" style={{ color: 'rgba(255,255,255,0.6)' }}>Famehub</a>. All rights reserved. Built with ♥ for ambitious people.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {['Privacy Policy', 'Terms of Service', 'FAQs'].map(link => (
                  <a key={link} href="#" className="footer-link-th" style={{ fontSize: '0.82rem' }}>{link}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>

        {/* Scroll to top */}
        <button
          className={`scroll-top-btn${scrollTopVisible ? ' visible' : ''}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>
    </>
  );
}