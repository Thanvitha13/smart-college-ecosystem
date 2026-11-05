import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDownUp, ArrowLeft, ArrowRight, ArrowUpRight, Bell, Bookmark, BriefcaseBusiness, Check, ChevronDown, CircleAlert, Clock3, Compass, ExternalLink, FileText, Filter, LayoutDashboard, LockKeyhole, Pencil, Plus, Search, Sparkles, Target, Trash2, TrendingUp, Users, X } from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';
import api, { messageFromError } from './services/api.js';
import AppShell from './components/AppShell.jsx';
import OpportunityCard from './components/OpportunityCard.jsx';
import OpportunityScene from './components/OpportunityScene.jsx';

const categories = ['Internship', 'Hackathon', 'Scholarship', 'Technical Event', 'Workshop', 'Coding Competition', 'Online Course', 'Research'];
const dateLabel = (value) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date';
const errorText = (error) => messageFromError(error);

function Loading({ label = 'Loading your workspace' }) { return <div className="loading-state"><span className="loader-ring" /><p>{label}</p></div>; }
function EmptyState({ icon: Icon = Compass, title, copy, action }) { return <div className="empty-state"><span className="empty-icon"><Icon size={22} /></span><h3>{title}</h3><p>{copy}</p>{action}</div>; }
function PageHeading({ eyebrow, title, copy, action }) { return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{copy && <p className="page-copy">{copy}</p>}</div>{action}</div>; }
function ErrorBanner({ message, onClose }) { return message ? <div className="error-banner" role="alert"><CircleAlert size={17} /><span>{message}</span>{onClose && <button className="icon-button" onClick={onClose} aria-label="Dismiss error"><X size={15} /></button>}</div> : null; }

function Landing() {
  const [stats, setStats] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  useEffect(() => {
    Promise.all([api.get('/opportunities/stats'), api.get('/opportunities?limit=3&sort=latest')])
      .then(([statsResponse, opportunityResponse]) => { setStats(statsResponse.data); setFeatured(opportunityResponse.data.opportunities || []); })
      .catch((cause) => setError(errorText(cause)));
  }, []);
  return <div className="landing-page">
    <header className="landing-nav"><Link to="/" className="brand-lockup"><span className="brand-mark">o<span>.</span></span><span className="brand-name">opportunityhub</span></Link><nav><a href="#discover">Discover</a><a href="#how-it-works">How it works</a></nav><div className="landing-actions">{user ? <Link className="button button-dark" to={user.role === 'admin' ? '/admin' : '/dashboard'}>Open workspace <ArrowUpRight size={16} /></Link> : <><Link className="text-link" to="/auth">Log in</Link><Link className="button button-lime" to="/auth?mode=register">Get started <ArrowRight size={16} /></Link></>}</div></header>
    <main>
      <section className="hero-section"><div className="hero-copy"><span className="hero-kicker"><span className="live-dot" />THE STUDENT OPPORTUNITY NETWORK</span><h1>Make room<br />for your <em>next.</em></h1><p>Internships, ideas, people, possibility. Find the opportunities that move you forward, all in one place.</p><div className="hero-actions"><Link className="button button-lime button-large" to={user ? '/explore' : '/auth?mode=register'}>{user ? 'Explore opportunities' : 'Find your opportunity'} <ArrowRight size={18} /></Link><a className="button button-outline button-large" href="#discover">See what’s out there <ArrowDownUp size={17} /></a></div><div className="hero-proof"><div className="avatar-stack"><i>J</i><i>A</i><i>M</i><i>+</i></div><span>Made for students<br /><strong>building what’s next</strong></span></div></div><div className="hero-art"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-label label-one"><span className="label-icon label-green"><BriefcaseBusiness size={15} /></span><span><strong>Product intern</strong><small>Northstar Labs</small></span><ArrowUpRight size={15} /></div><div className="art-label label-two"><span className="label-icon label-coral"><Sparkles size={15} /></span><span><strong>Buildathon ’26</strong><small>Applications open</small></span><span className="label-live" /></div><div className="art-center"><span>YOUR<br />NEXT<br /><em>MOVE</em></span><div className="art-center-ring" /></div><div className="art-bottom-note"><span>01 / 04</span><span>OPPORTUNITY IS A PRACTICE</span></div><OpportunityScene /></div></section>
      <section className="ticker-band"><div className="ticker-track">{['Find your people', 'Make something matter', 'Get a little closer', 'Find your people', 'Make something matter', 'Get a little closer'].map((item, index) => <span key={`${item}-${index}`}>{item}<i>✳</i></span>)}</div></section>
      <section className="stats-strip" id="discover"><div className="stats-intro"><span className="eyebrow">A HEAD START, ALL IN ONE PLACE</span><h2>Good things<br />are happening.</h2><p>We keep the door open and the search simple.</p></div><div className="stats-grid">{[[stats?.total, 'opportunities open', '01'], [stats?.internships, 'internships', '02'], [stats?.events, 'events & builds', '03'], [stats?.students, 'students here', '04']].map(([value, label, index]) => <div className="stat-item" key={index}><span className="stat-index">/{index}</span><strong>{value == null ? '—' : Number(value).toLocaleString()}</strong><span>{label}</span></div>)}</div></section>
      <section className="featured-section"><div className="section-heading"><div><span className="eyebrow">FRESH ON THE BOARD</span><h2>Worth a closer look.</h2></div><Link className="inline-link" to="/explore">View all opportunities <ArrowRight size={17} /></Link></div><ErrorBanner message={error} />{featured.length ? <div className="opportunity-grid">{featured.map((opportunity) => <OpportunityCard key={opportunity._id} opportunity={opportunity} />)}</div> : !error && <div className="public-empty"><p>New possibilities will appear here.</p><Link className="inline-link" to="/explore">Browse the board <ArrowRight size={16} /></Link></div>}</section>
      <section className="how-section" id="how-it-works"><div className="how-title"><span className="eyebrow">LESS SCROLLING, MORE DOING</span><h2>Take the<br /><em>next step.</em></h2></div><div className="steps-grid"><article><span>01</span><Search size={20} /><h3>Find your fit</h3><p>Search a focused board of opportunities, from your first workshop to your next role.</p></article><article><span>02</span><Bookmark size={20} /><h3>Keep it close</h3><p>Save what catches your eye and keep deadlines in view without the spreadsheet sprawl.</p></article><article><span>03</span><TrendingUp size={20} /><h3>Move forward</h3><p>Track applications, see what is coming up, and build momentum on your terms.</p></article></div></section>
      <section className="closing-band"><div><span className="eyebrow">THE NEXT ONE COULD BE YOURS</span><h2>Go see what’s possible.</h2></div><Link className="button button-dark button-large" to={user ? '/explore' : '/auth?mode=register'}>Get started <ArrowUpRight size={18} /></Link></section>
    </main><footer className="landing-footer"><Link to="/" className="brand-lockup"><span className="brand-mark">o<span>.</span></span><span className="brand-name">opportunityhub</span></Link><span>Make room for what’s next.</span><a href="mailto:hello@opportunityhub.local">Contact <ArrowUpRight size={14} /></a></footer>
  </div>;
}

function AuthPage() {
  const { user, signIn, register } = useAuth();
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', department: '', year: '', skills: '', interests: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();
  useEffect(() => { setMode(['register', 'forgot'].includes(params.get('mode')) ? params.get('mode') : 'login'); }, [params]);
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  const changeMode = (next) => { setMode(next); setParams(next === 'login' ? {} : { mode: next }); setError(''); setNotice(''); };
  const submit = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'forgot') {
        const { data } = await api.post('/auth/forgot-password', { email: form.email });
        setNotice(data.message);
        return;
      }
      const account = mode === 'login' ? await signIn({ email: form.email, password: form.password }) : await register(form);
      navigate(account.role === 'admin' ? '/admin' : '/dashboard');
    } catch (cause) { setError(errorText(cause)); } finally { setBusy(false); }
  };
  return <div className="auth-page"><Link to="/" className="brand-lockup auth-brand"><span className="brand-mark">o<span>.</span></span><span className="brand-name">opportunityhub</span></Link><div className="auth-layout"><aside className="auth-aside"><span className="eyebrow">A LITTLE CLOSER TO WHAT’S NEXT</span><h1>Make your<br />next move<br /><em>count.</em></h1><p>One place to find the work, people, and ideas that help you grow.</p><div className="auth-aside-foot"><span>01 — FIND</span><span>02 — SAVE</span><span>03 — GO</span></div></aside><section className="auth-form-panel"><div className="auth-form-wrap"><span className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : mode === 'forgot' ? 'ACCOUNT RECOVERY' : 'START HERE'}</span><h2>{mode === 'login' ? 'Good to see you.' : mode === 'forgot' ? 'Let’s get you back in.' : 'Make an account.'}</h2><p>{mode === 'login' ? 'Pick up right where you left off.' : mode === 'forgot' ? 'We’ll send a secure reset link to your email.' : 'Your next opportunity is closer than you think.'}</p><div className="auth-tabs"><button className={mode === 'login' ? 'selected' : ''} onClick={() => changeMode('login')}>Log in</button><button className={mode === 'register' ? 'selected' : ''} onClick={() => changeMode('register')}>Create account</button></div><ErrorBanner message={error} />{notice && <p className="success-note">{notice}</p>}
      <form className="form-stack" onSubmit={submit}>
        {mode === 'register' && <><label>Full name<input required autoComplete="name" maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Jordan Lee" /></label><label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@college.edu" /></label><label>Password<input required type="password" minLength="8" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" /></label><label>College name <span className="optional">OPTIONAL</span><input value={form.college} onChange={(event) => setForm({ ...form, college: event.target.value })} placeholder="Your school" /></label><div className="form-row"><label>Department<input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} placeholder="e.g. Computer science" /></label><label>Study year<select value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })}><option value="">Select</option>{['1st year', '2nd year', '3rd year', '4th year', 'Graduate'].map((year) => <option key={year}>{year}</option>)}</select></label></div><label>Skills <span className="optional">COMMA SEPARATED</span><input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="React, writing, data analysis" /></label><label>Areas of interest <span className="optional">COMMA SEPARATED</span><input value={form.interests} onChange={(event) => setForm({ ...form, interests: event.target.value })} placeholder="Technology, climate, design" /></label></>}
        {(mode === 'login' || mode === 'forgot') && <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@college.edu" /></label>}
        {mode === 'login' && <><label>Password<input required type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Your password" /></label><button type="button" className="forgot-link" onClick={() => changeMode('forgot')}>Forgot password?</button></>}
        <button className="button button-lime button-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : mode === 'forgot' ? 'Send reset link' : 'Create my account'} <ArrowRight size={17} /></button>
      </form><p className="auth-switch">{mode === 'login' ? 'New around here?' : mode === 'forgot' ? 'Remembered your password?' : 'Already have an account?'} <button onClick={() => changeMode(mode === 'register' ? 'login' : 'login')}>{mode === 'login' ? 'Create account' : 'Log in'}</button></p><div className="secure-note"><LockKeyhole size={14} />Your account and information stay yours.</div></div></section></div></div>;
}

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try { await api.post(`/auth/reset-password/${token}`, { password }); setDone(true); }
    catch (cause) { setError(errorText(cause)); }
    finally { setBusy(false); }
  };
  return <div className="auth-page"><Link to="/" className="brand-lockup auth-brand"><span className="brand-mark">o<span>.</span></span><span className="brand-name">opportunityhub</span></Link><div className="reset-panel"><span className="eyebrow">ACCOUNT RECOVERY</span><h1>{done ? 'You’re back on track.' : 'Choose a new password.'}</h1>{done ? <><p>Your password has been updated. Sign in to continue.</p><Link className="button button-lime button-full" to="/auth">Go to login <ArrowRight size={16} /></Link></> : <><p>This secure link can only be used once.</p><ErrorBanner message={error} /><form className="form-stack" onSubmit={submit}><label>New password<input required type="password" minLength="8" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label><button className="button button-lime button-full" disabled={busy}>{busy ? 'Updating…' : 'Update password'} <Check size={16} /></button></form></>}</div></div>;
}

function RequireAuth({ children, admin = false, anyRole = false }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/auth" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (!admin && !anyRole && user.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}
function AppFrame({ admin = false }) { return <RequireAuth admin={admin}><AppShell /></RequireAuth>; }
function AnyRoleFrame() { return <RequireAuth anyRole><AppShell /></RequireAuth>; }

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [error, setError] = useState('');
  const refresh = () => Promise.all([api.get('/students/dashboard'), api.get('/opportunities/recommended'), api.get('/saved')]).then(([dash, recs, saved]) => {
    setData(dash.data); setRecommended(recs.data); setSavedIds(new Set(saved.data.map((item) => item.opportunityId?._id).filter(Boolean)));
  }).catch((cause) => setError(errorText(cause)));
  useEffect(() => { refresh(); }, []);
  const toggleSave = async (id, wasSaved) => {
    try { if (wasSaved) await api.delete(`/saved/${id}`); else await api.post(`/saved/${id}`); setSavedIds((current) => { const updated = new Set(current); if (wasSaved) updated.delete(id); else updated.add(id); return updated; }); }
    catch (cause) { setError(errorText(cause)); }
  };
  if (!data && !error) return <Loading />;
  return <div className="page-stack"><PageHeading eyebrow="YOUR OPPORTUNITY DESK" title={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${user?.name?.split(' ')[0] || 'there'}.`} copy="A little progress adds up. Here’s where you can start today." action={<Link className="button button-dark" to="/explore"><Compass size={16} /> Explore board</Link>} /><ErrorBanner message={error} />
    <div className="dashboard-metrics"><div className="metric-panel metric-feature"><span className="metric-icon"><Target size={19} /></span><span className="metric-label">YOUR PROFILE MATCH</span><strong>{user?.skills?.length || user?.interests?.length ? 'Ready' : 'Add details'}</strong><p>{user?.skills?.length || user?.interests?.length ? 'Recommendations are tuned to your interests.' : 'Add your skills to get more relevant picks.'}</p><Link to="/profile">Edit your profile <ArrowRight size={15} /></Link></div><div className="metric-panel"><span className="metric-icon metric-lime"><Bookmark size={18} /></span><span className="metric-label">SAVED</span><strong>{data?.savedCount ?? '—'}</strong><p>Opportunities to come back to</p><Link to="/saved">See saved <ArrowRight size={15} /></Link></div><div className="metric-panel"><span className="metric-icon metric-orange"><BriefcaseBusiness size={18} /></span><span className="metric-label">APPLICATIONS</span><strong>{data?.applicationCount ?? '—'}</strong><p>Every next step, in one view</p><Link to="/applications">Track progress <ArrowRight size={15} /></Link></div><div className="metric-panel"><span className="metric-icon metric-sand"><Clock3 size={18} /></span><span className="metric-label">UP NEXT</span><strong>{data?.upcomingDeadlines?.length || 0}</strong><p>Deadlines in the next 14 days</p><Link to="/notifications">View reminders <ArrowRight size={15} /></Link></div></div>
    <div className="section-heading dashboard-section-title"><div><span className="eyebrow">PICKED FOR YOU</span><h2>Good places to begin.</h2></div><Link className="inline-link" to="/explore">All opportunities <ArrowRight size={16} /></Link></div>
    {recommended.length ? <div className="opportunity-grid">{recommended.slice(0, 3).map((item) => <OpportunityCard key={item._id} opportunity={item} saved={savedIds.has(item._id)} onToggleSave={toggleSave} showMatch />)}</div> : <EmptyState icon={Sparkles} title="Your next recommendation is out there" copy="Add skills and interests to your profile or explore the full board." action={<Link className="inline-link" to="/explore">Explore opportunities <ArrowRight size={15} /></Link>} />}
    <section className="deadline-panel"><div className="deadline-panel-heading"><div><span className="eyebrow">THE NEXT TWO WEEKS</span><h2>Dates to keep close.</h2></div><Link className="inline-link" to="/notifications">All reminders <ArrowRight size={15} /></Link></div>{data?.upcomingDeadlines?.length ? <div className="deadline-list">{data.upcomingDeadlines.map((item) => <Link className="deadline-row" key={item._id} to={`/opportunities/${item._id}`}><span className="deadline-day">{new Date(item.deadline).getDate()}</span><span className="deadline-meta"><strong>{item.title}</strong><small>{item.organization} · {item.category}</small></span><span className="deadline-date">{dateLabel(item.deadline)}</span><ArrowUpRight size={16} /></Link>)}</div> : <p className="muted-copy">No deadlines coming up in the next 14 days.</p>}</section>
  </div>;
}

function Explore() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [skill, setSkill] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [sort, setSort] = useState('latest');
  const [opportunities, setOpportunities] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const load = async () => {
    setBusy(true); setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (category) params.set('category', category);
      if (location.trim()) params.set('location', location.trim());
      if (skill.trim()) params.set('skill', skill.trim());
      if (eligibility.trim()) params.set('eligibility', eligibility.trim());
      params.set('sort', sort);
      const [results, saved] = await Promise.all([api.get(`/opportunities?${params}`), api.get('/saved').catch(() => ({ data: [] }))]);
      setOpportunities(results.data.opportunities || []); setTotal(results.data.total || 0);
      setSavedIds(new Set(saved.data.map((item) => item.opportunityId?._id).filter(Boolean)));
    } catch (cause) { setError(errorText(cause)); } finally { setBusy(false); }
  };
  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [category, sort, search, location, skill, eligibility]);
  const submitSearch = (event) => { event.preventDefault(); load(); };
  const toggleSave = async (id, wasSaved) => {
    try { if (wasSaved) await api.delete(`/saved/${id}`); else await api.post(`/saved/${id}`); setSavedIds((current) => { const next = new Set(current); wasSaved ? next.delete(id) : next.add(id); return next; }); }
    catch (cause) { setError(errorText(cause)); }
  };
  return <div className="page-stack"><PageHeading eyebrow="THE BOARD" title="Find your next." copy="A focused search for the experiences that take you somewhere." /><ErrorBanner message={error} onClose={() => setError('')} />
    <form className="search-panel" onSubmit={submitSearch}><label className="search-field"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Role, organization, or keyword" aria-label="Search opportunities" /><button className="button button-dark" type="submit">Search <ArrowRight size={15} /></button></label><div className="filter-row"><label className="filter-control"><Filter size={15} /><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label><label className="filter-control"><input aria-label="Filter by location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" onBlur={load} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); load(); } }} /></label><label className="filter-control"><input aria-label="Filter by skill" value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="Required skill" onBlur={load} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); load(); } }} /></label><label className="filter-control"><input aria-label="Filter by eligibility" value={eligibility} onChange={(event) => setEligibility(event.target.value)} placeholder="Eligibility" onBlur={load} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); load(); } }} /></label><label className="filter-control sort-control"><ArrowDownUp size={15} /><select aria-label="Sort opportunities" value={sort} onChange={(event) => setSort(event.target.value)}><option value="latest">Recently added</option><option value="deadline">Closing soon</option></select><ChevronDown size={14} /></label></div></form>
    <div className="results-heading"><span><strong>{total}</strong> opportunities</span><span>Updated as new listings arrive</span></div>
    {busy ? <Loading label="Finding your next opportunity" /> : opportunities.length ? <div className="opportunity-grid">{opportunities.map((item) => <OpportunityCard key={item._id} opportunity={item} saved={savedIds.has(item._id)} onToggleSave={toggleSave} />)}</div> : <EmptyState title="No matches just yet" copy="Try a different search or loosen one of your filters." action={<button className="button button-outline-dark" onClick={() => { setSearch(''); setCategory(''); setLocation(''); setSkill(''); setEligibility(''); setSort('latest'); }}>Clear filters <X size={15} /></button>} />}
  </div>;
}

function OpportunityDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [saved, setSaved] = useState(false);
  const [application, setApplication] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api.get(`/opportunities/${id}`), api.get('/saved').catch(() => ({ data: [] })), api.get('/applications/my').catch(() => ({ data: [] }))]).then(([result, savedItems, applications]) => {
      setItem(result.data); setSaved(savedItems.data.some((entry) => entry.opportunityId?._id === id));
      setApplication(applications.data.find((entry) => entry.opportunityId?._id === id) || null);
    }).catch((cause) => setError(errorText(cause))).finally(() => setBusy(false));
  }, [id]);
  const toggle = async () => { try { if (saved) await api.delete(`/saved/${id}`); else await api.post(`/saved/${id}`); setSaved(!saved); } catch (cause) { setError(errorText(cause)); } };
  const apply = async (event) => { if (event?.currentTarget?.tagName === 'BUTTON') window.open(item.applicationLink, '_blank', 'noopener,noreferrer'); try { const { data } = await api.post('/applications', { opportunityId: id }); setApplication({ ...data, opportunityId: item }); } catch (cause) { setError(errorText(cause)); } };
  if (busy) return <Loading label="Opening opportunity" />;
  if (!item) return <div className="page-stack"><ErrorBanner message={error || 'Opportunity not found.'} /><Link className="inline-link" to="/explore"><ArrowLeft size={16} /> Back to the board</Link></div>;
  const days = Math.ceil((new Date(item.deadline) - Date.now()) / 86400000);
  return <div className="page-stack detail-page"><Link className="back-link" to="/explore"><ArrowLeft size={16} /> Back to opportunities</Link><ErrorBanner message={error} onClose={() => setError('')} /><div className="detail-layout"><article className="detail-main"><div className="detail-kicker"><span className="category-tag">{item.category}</span><span className="detail-live"><span className="live-dot" />ACCEPTING APPLICATIONS</span></div><h1>{item.title}</h1><p className="detail-org">{item.organization} <span>·</span> {item.location}</p><div className="detail-action-row"><button className="button button-lime" onClick={apply} disabled={Boolean(application) || days < 0}>{application ? <><Check size={17} /> Application tracked</> : <>Apply on the official site <ExternalLink size={16} /></>}</button><button className={`button button-outline-dark ${saved ? 'saved-button' : ''}`} onClick={toggle}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Saved' : 'Save opportunity'}</button></div><div className="detail-section"><span className="eyebrow">ABOUT THE OPPORTUNITY</span><p>{item.description}</p></div><div className="detail-section"><span className="eyebrow">WHO CAN APPLY</span><p>{item.eligibility}</p></div>{item.requiredSkills?.length > 0 && <div className="detail-section"><span className="eyebrow">SKILLS THAT HELP</span><div className="skill-list">{item.requiredSkills.map((skillName) => <span key={skillName}>{skillName}</span>)}</div></div>}{item.benefits?.length > 0 && <div className="detail-section"><span className="eyebrow">WHAT’S INCLUDED</span><ul className="benefit-list">{item.benefits.map((benefit) => <li key={benefit}><Check size={15} />{benefit}</li>)}</ul></div>}{item.applicationProcedure && <div className="detail-section"><span className="eyebrow">HOW TO APPLY</span><p>{item.applicationProcedure}</p></div>}</article><aside className="detail-sidebar"><div className="deadline-card"><span className="eyebrow">APPLICATION DEADLINE</span><strong>{dateLabel(item.deadline)}</strong><span className={days <= 5 ? 'deadline-urgent' : 'deadline-remaining'}>{days < 0 ? 'Applications closed' : days === 0 ? 'Due today' : `${days} days remaining`}</span><div className="deadline-progress"><i style={{ width: `${Math.min(100, Math.max(12, 100 - days * 2))}%` }} /></div><a className="button button-dark button-full" href={item.applicationLink} target="_blank" rel="noreferrer" onClick={user && !application ? apply : undefined}>Go to application <ArrowUpRight size={16} /></a></div><div className="detail-side-note"><span className="side-note-icon"><FileText size={17} /></span><div><strong>Keep track as you go.</strong><p>Save the listing or mark it in your application tracker.</p></div></div></aside></div></div>;
}

function ReportOpportunity() {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('Incorrect information');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try { await api.post(`/reports/${id}`, { reason, details }); setSent(true); setOpen(false); }
    catch (cause) { setError(errorText(cause)); }
  };
  if (sent) return <p className="success-note">Thanks. Your report was sent to the OpportunityHub team.</p>;
  return <section className="report-panel"><button className="report-toggle" onClick={() => setOpen((value) => !value)}><CircleAlert size={15} />Report a problem with this listing</button>{error && <ErrorBanner message={error} />}{open && <form className="report-form" onSubmit={submit}><label>Reason<select value={reason} onChange={(event) => setReason(event.target.value)}>{['Expired listing', 'Incorrect information', 'Application link issue', 'Other'].map((option) => <option key={option}>{option}</option>)}</select></label><label>Additional details <span className="optional">OPTIONAL</span><textarea rows="3" maxLength="1200" value={details} onChange={(event) => setDetails(event.target.value)} /></label><button className="button button-dark">Send report <ArrowRight size={15} /></button></form>}</section>;
}

function AdminOpportunityDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get(`/opportunities/${id}`).then(({ data }) => setItem(data)).catch((cause) => setError(errorText(cause))); }, [id]);
  if (!item && !error) return <Loading label="Opening listing" />;
  if (!item) return <div className="page-stack"><ErrorBanner message={error} /><Link className="inline-link" to="/admin/opportunities">Back to listings <ArrowRight size={15} /></Link></div>;
  return <div className="page-stack"><Link className="back-link" to="/admin"><ArrowLeft size={16} /> Admin overview</Link><PageHeading eyebrow={`${item.organization} · ${item.category}`} title={item.title} copy={`${item.location} · Deadline ${dateLabel(item.deadline)}`} action={<Link className="button button-dark" to="/admin/opportunities">Manage listings <ArrowUpRight size={16} /></Link>} /><section className="deadline-panel"><span className="eyebrow">DESCRIPTION</span><p className="detail-description">{item.description}</p><div className="detail-section"><span className="eyebrow">ELIGIBILITY</span><p>{item.eligibility}</p></div><div className="skill-list">{item.requiredSkills?.map((skill) => <span key={skill}>{skill}</span>)}</div><a className="inline-link" href={item.applicationLink} target="_blank" rel="noreferrer">Official application <ExternalLink size={14} /></a></section></div>;
}

function OpportunityPage() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminOpportunityDetails /> : <><OpportunityDetails /><ReportOpportunity /></>;
}

function SavedPage() {
  const [items, setItems] = useState([]); const [busy, setBusy] = useState(true); const [error, setError] = useState('');
  const load = () => api.get('/saved').then(({ data }) => setItems(data)).catch((cause) => setError(errorText(cause))).finally(() => setBusy(false));
  useEffect(() => { load(); }, []);
  const remove = async (id) => { try { await api.delete(`/saved/${id}`); setItems((current) => current.filter((entry) => entry.opportunityId?._id !== id)); } catch (cause) { setError(errorText(cause)); } };
  return <div className="page-stack"><PageHeading eyebrow="YOUR SHORTLIST" title="Keep it close." copy="Good possibilities, saved for when you’re ready." action={<Link className="button button-dark" to="/explore"><Compass size={16} /> Browse board</Link>} /><ErrorBanner message={error} />{busy ? <Loading /> : items.length ? <div className="opportunity-grid">{items.filter((entry) => entry.opportunityId).map((entry) => <OpportunityCard key={entry._id} opportunity={entry.opportunityId} saved onToggleSave={remove} />)}</div> : <EmptyState icon={Bookmark} title="Nothing saved yet" copy="When something catches your eye, bookmark it and find it here." action={<Link className="button button-lime" to="/explore">Find something good <ArrowRight size={16} /></Link>} />}</div>;
}

function ApplicationsPage() {
  const [items, setItems] = useState([]); const [busy, setBusy] = useState(true); const [error, setError] = useState('');
  useEffect(() => { api.get('/applications/my').then(({ data }) => setItems(data)).catch((cause) => setError(errorText(cause))).finally(() => setBusy(false)); }, []);
  const update = async (id, personalStatus) => { try { const { data } = await api.patch(`/applications/${id}/tracking`, { personalStatus }); setItems((current) => current.map((item) => item._id === id ? data : item)); } catch (cause) { setError(errorText(cause)); } };
  return <div className="page-stack"><PageHeading eyebrow="YOUR FOLLOW-THROUGH" title="Keep things moving." copy="Every application, from first click to final answer." action={<Link className="button button-dark" to="/explore"><Compass size={16} /> Find an opportunity</Link>} /><ErrorBanner message={error} />{busy ? <Loading /> : items.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>OPPORTUNITY</th><th>APPLIED</th><th>ORGANIZATION STATUS</th><th>MY TRACKER</th></tr></thead><tbody>{items.filter((item) => item.opportunityId).map((item) => <tr key={item._id}><td><Link className="table-title" to={`/opportunities/${item.opportunityId._id}`}>{item.opportunityId.title}</Link><span className="table-subtitle">{item.opportunityId.organization}</span></td><td>{dateLabel(item.appliedAt)}</td><td><span className={`status-pill status-${item.status?.toLowerCase().replaceAll(' ', '-')}`}>{item.status}</span></td><td><select className="table-select" aria-label={`Update tracking status for ${item.opportunityId.title}`} value={item.personalStatus || 'Applied'} onChange={(event) => update(item._id, event.target.value)}>{['Planning', 'Applied', 'Interviewing', 'Completed', 'Withdrawn'].map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div> : <EmptyState icon={BriefcaseBusiness} title="Your first application starts somewhere" copy="Apply to an opportunity and keep your progress organized right here." action={<Link className="button button-lime" to="/explore">Explore the board <ArrowRight size={16} /></Link>} />}</div>;
}

function NotificationsPage() {
  const [items, setItems] = useState([]); const [busy, setBusy] = useState(true); const [error, setError] = useState('');
  const load = () => api.get('/notifications').then(({ data }) => setItems(data)).catch((cause) => setError(errorText(cause))).finally(() => setBusy(false));
  useEffect(() => { load(); }, []);
  const markRead = async (id) => { try { const { data } = await api.patch(`/notifications/${id}/read`); setItems((current) => current.map((item) => item._id === id ? data : item)); } catch (cause) { setError(errorText(cause)); } };
  const markAll = async () => { try { await api.patch('/notifications/read-all'); setItems((current) => current.map((item) => ({ ...item, isRead: true }))); } catch (cause) { setError(errorText(cause)); } };
  const unread = items.some((item) => !item.isRead);
  return <div className="page-stack"><PageHeading eyebrow="A FRIENDLY NUDGE" title="Stay in the loop." copy="New listings, important dates, and updates to your applications." action={unread ? <button className="button button-outline-dark" onClick={markAll}><Check size={15} /> Mark all read</button> : null} /><ErrorBanner message={error} />{busy ? <Loading /> : items.length ? <div className="notification-list">{items.map((item) => <article key={item._id} className={`notification-row ${item.isRead ? '' : 'unread'}`}><span className={`notification-icon notification-${item.type}`}><Bell size={17} /></span><div className="notification-body"><div className="notification-heading"><strong>{item.title}</strong><time>{dateLabel(item.createdAt)}</time></div><p>{item.message}</p>{item.relatedOpportunity && <Link className="inline-link" to={`/opportunities/${item.relatedOpportunity._id}`}>{item.relatedOpportunity.title} <ArrowRight size={14} /></Link>}</div>{!item.isRead && <button className="mark-read" onClick={() => markRead(item._id)}>Mark read</button>}</article>)}</div> : <EmptyState icon={Bell} title="All caught up" copy="Your important updates will land here when there’s something to share." />}</div>;
}

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', college: user?.college || '', department: user?.department || '', year: user?.year || '', skills: user?.skills?.join(', ') || '', interests: user?.interests?.join(', ') || '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const [notice, setNotice] = useState(''); const [error, setError] = useState(''); const [resumeBusy, setResumeBusy] = useState(false);
  const save = async (event) => { event.preventDefault(); setNotice(''); setError(''); try { const { data } = await api.put('/students/profile', form); setUser(data.user); setNotice('Profile saved. Your recommendations will use these details.'); } catch (cause) { setError(errorText(cause)); } };
  const changePassword = async (event) => { event.preventDefault(); setNotice(''); setError(''); try { const { data } = await api.put('/students/password', password); setNotice(data.message); setPassword({ currentPassword: '', newPassword: '' }); } catch (cause) { setError(errorText(cause)); } };
  const uploadResume = async (event) => { event.preventDefault(); const file = event.currentTarget.elements.resume.files[0]; if (!file) return setError('Choose a resume file first.'); const body = new FormData(); body.append('resume', file); setResumeBusy(true); setError(''); try { const { data } = await api.post('/students/resume', body); setUser(data.user); setNotice('Resume uploaded.'); } catch (cause) { setError(errorText(cause)); } finally { setResumeBusy(false); } };
  return <div className="page-stack"><PageHeading eyebrow="YOUR HOME BASE" title="Make it yours." copy="A few details help us surface opportunities that fit you." /><ErrorBanner message={error} /><div className="profile-layout"><form className="settings-panel" onSubmit={save}><div className="settings-panel-heading"><span className="eyebrow">PROFILE DETAILS</span><p>These details shape your recommendations and stay private to your account.</p></div><div className="form-stack"><label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email address<input value={user?.email || ''} disabled /></label><label>College or university<input value={form.college} onChange={(event) => setForm({ ...form, college: event.target.value })} /></label><div className="form-row"><label>Department<input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} /></label><label>Study year<select value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })}><option value="">Select</option>{['1st year', '2nd year', '3rd year', '4th year', 'Graduate'].map((year) => <option key={year}>{year}</option>)}</select></label></div><label>Skills <span className="optional">COMMA SEPARATED</span><input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="React, research, writing" /></label><label>Areas of interest <span className="optional">COMMA SEPARATED</span><input value={form.interests} onChange={(event) => setForm({ ...form, interests: event.target.value })} placeholder="Climate, product, public health" /></label><button className="button button-dark">Save profile <Check size={16} /></button>{notice && <p className="success-note">{notice}</p>}</div></form><aside className="settings-side"><form className="settings-panel" onSubmit={uploadResume}><span className="eyebrow">YOUR RESUME</span><p className="settings-description">Keep a resume ready for the next application.</p><label className="file-drop"><FileText size={20} /><span>{user?.resume ? 'Replace your resume' : 'Choose a resume file'}</span><small>PDF, DOC, or DOCX · 5 MB max</small><input type="file" name="resume" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label>{user?.resume && <a className="inline-link" href={user.resume} target="_blank" rel="noreferrer">View current resume <ExternalLink size={14} /></a>}<button className="button button-outline-dark button-full" disabled={resumeBusy}>{resumeBusy ? 'Uploading…' : 'Upload resume'} <ArrowUpRight size={15} /></button></form><form className="settings-panel" onSubmit={changePassword}><span className="eyebrow">ACCOUNT SECURITY</span><p className="settings-description">Choose a unique password with at least eight characters.</p><div className="form-stack"><label>Current password<input required type="password" autoComplete="current-password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} /></label><label>New password<input required type="password" minLength="8" autoComplete="new-password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} /></label><button className="button button-outline-dark">Update password <LockKeyhole size={15} /></button></div></form></aside></div></div>;
}

function ProfileImagePanel() {
  const { user, setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    const file = event.currentTarget.elements.image.files[0];
    if (!file) return setError('Choose an image first.');
    const body = new FormData();
    body.append('image', file);
    setBusy(true); setError(''); setNotice('');
    try { const { data } = await api.post('/students/profile-image', body); setUser(data.user); setNotice('Profile photo updated.'); }
    catch (cause) { setError(errorText(cause)); }
    finally { setBusy(false); }
  };
  return <section className="profile-photo-panel"><div><span className="eyebrow">PROFILE PHOTO</span><p>Choose a clear JPG, PNG, or WEBP image, up to 2 MB.</p>{notice && <p className="success-note">{notice}</p>}<ErrorBanner message={error} /></div><div className="profile-photo-preview">{user?.profileImage ? <img src={user.profileImage} alt="Your profile" /> : <span>{user?.name?.slice(0, 1).toUpperCase()}</span>}</div><form onSubmit={submit}><label className="button button-outline-dark photo-picker">Choose image<input type="file" name="image" accept="image/jpeg,image/png,image/webp" /></label><button className="button button-dark" disabled={busy}>{busy ? 'Uploading…' : 'Update photo'} <ArrowUpRight size={15} /></button></form></section>;
}

function ProfileRoute() { return <><ProfilePage /><ProfileImagePanel /></>; }

function AdminDashboard() {
  const [data, setData] = useState(null); const [stats, setStats] = useState(null); const [error, setError] = useState('');
  useEffect(() => { Promise.all([api.get('/admin/dashboard'), api.get('/admin/statistics')]).then(([overview, analytics]) => { setData(overview.data); setStats(analytics.data); }).catch((cause) => setError(errorText(cause))); }, []);
  return <div className="page-stack"><PageHeading eyebrow="ADMIN WORKSPACE" title="Keep opportunity open." copy="A live view of the student network and its listings." action={<Link className="button button-lime" to="/admin/opportunities"><Plus size={16} /> Publish opportunity</Link>} /><ErrorBanner message={error} />{!data && !error ? <Loading /> : <><div className="admin-metrics"><div className="admin-metric"><Users size={18} /><span>STUDENTS</span><strong>{data?.students ?? '—'}</strong></div><div className="admin-metric"><Compass size={18} /><span>LIVE LISTINGS</span><strong>{data?.opportunities ?? '—'}</strong></div><div className="admin-metric"><BriefcaseBusiness size={18} /><span>APPLICATIONS</span><strong>{data?.applications ?? '—'}</strong></div><div className="admin-metric"><Clock3 size={18} /><span>AWAITING REVIEW</span><strong>{data?.pending ?? '—'}</strong></div></div><div className="admin-content-grid"><section className="deadline-panel"><div className="deadline-panel-heading"><div><span className="eyebrow">LATEST LISTINGS</span><h2>On the board.</h2></div><Link className="inline-link" to="/admin/opportunities">Manage listings <ArrowRight size={15} /></Link></div>{data?.recentOpportunities?.length ? <div className="deadline-list">{data.recentOpportunities.map((item) => <Link className="deadline-row" key={item._id} to={`/opportunities/${item._id}`}><span className="admin-listing-mark"><Compass size={16} /></span><span className="deadline-meta"><strong>{item.title}</strong><small>{item.organization} · {item.category}</small></span><span className="deadline-date">{dateLabel(item.createdAt)}</span><ArrowUpRight size={16} /></Link>)}</div> : <EmptyState title="No listings yet" copy="Publish the first opportunity for students." />}</section><section className="deadline-panel category-breakdown"><span className="eyebrow">OPPORTUNITY MIX</span><h2>By category.</h2>{stats?.byCategory?.length ? stats.byCategory.map((row) => <div className="bar-row" key={row._id}><span>{row._id}</span><div><i style={{ width: `${Math.max(8, (row.count / Math.max(...stats.byCategory.map((entry) => entry.count))) * 100)}%` }} /></div><strong>{row.count}</strong></div>) : <p className="muted-copy">Category totals appear as listings are published.</p>}</section></div><section className="deadline-panel status-breakdown"><span className="eyebrow">APPLICATION STATUS</span><h2>Student progress.</h2>{stats?.applicationsByStatus?.length ? <div className="status-stat-row">{stats.applicationsByStatus.map((row) => <div key={row._id}><strong>{row.count}</strong><span>{row._id}</span></div>)}</div> : <p className="muted-copy">Application updates will appear here.</p>}</section></>}</div>;
}

const emptyOpportunity = { title: '', organization: '', category: 'Internship', description: '', location: 'Remote', eligibility: '', requiredSkills: '', deadline: '', applicationLink: '', image: '', benefits: '', applicationProcedure: '' };
function AdminOpportunities() {
  const [items, setItems] = useState([]); const [form, setForm] = useState(emptyOpportunity); const [editing, setEditing] = useState(''); const [busy, setBusy] = useState(true); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const load = () => api.get('/opportunities?limit=50&sort=latest&includeExpired=true').then(({ data }) => setItems(data.opportunities || [])).catch((cause) => setError(errorText(cause))).finally(() => setBusy(false));
  useEffect(() => { load(); }, []);
  const submit = async (event) => { event.preventDefault(); setError(''); setNotice(''); try { if (editing) await api.put(`/opportunities/${editing}`, form); else await api.post('/opportunities', form); setForm(emptyOpportunity); setEditing(''); setNotice(editing ? 'Opportunity updated.' : 'Opportunity published. Students have been notified.'); await load(); } catch (cause) { setError(errorText(cause)); } };
  const edit = (item) => { setEditing(item._id); setForm({ title: item.title, organization: item.organization, category: item.category, description: item.description, location: item.location, eligibility: item.eligibility, requiredSkills: item.requiredSkills?.join(', ') || '', deadline: new Date(item.deadline).toISOString().slice(0, 10), applicationLink: item.applicationLink, image: item.image || '', benefits: item.benefits?.join(', ') || '', applicationProcedure: item.applicationProcedure || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async (id) => { if (!window.confirm('Delete this opportunity and its saved/application records?')) return; try { await api.delete(`/opportunities/${id}`); setItems((current) => current.filter((item) => item._id !== id)); } catch (cause) { setError(errorText(cause)); } };
  return <div className="page-stack"><PageHeading eyebrow="PUBLISH AND MANAGE" title="Put good work on the board." copy="Create a listing once. Students see it in search, recommendations, and their alerts." /><ErrorBanner message={error} /><div className="admin-editor-layout"><form className="settings-panel admin-form" onSubmit={submit}><div className="settings-panel-heading"><span className="eyebrow">{editing ? 'EDIT LISTING' : 'NEW LISTING'}</span><p>Required details are marked in each field.</p></div><div className="form-stack"><label>Opportunity title<input required maxLength="180" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><div className="form-row"><label>Organization<input required value={form.organization} onChange={(event) => setForm({ ...form, organization: event.target.value })} /></label><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((categoryName) => <option key={categoryName}>{categoryName}</option>)}</select></label></div><label>Description<textarea required rows="5" maxLength="12000" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="form-row"><label>Location<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label><label>Deadline<input required type="date" min={new Date().toISOString().slice(0, 10)} value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></label></div><label>Eligibility<input value={form.eligibility} onChange={(event) => setForm({ ...form, eligibility: event.target.value })} /></label><label>Required skills <span className="optional">COMMA SEPARATED</span><input value={form.requiredSkills} onChange={(event) => setForm({ ...form, requiredSkills: event.target.value })} /></label><label>Benefits <span className="optional">COMMA SEPARATED</span><input value={form.benefits} onChange={(event) => setForm({ ...form, benefits: event.target.value })} /></label><label>Application procedure<textarea rows="3" value={form.applicationProcedure} onChange={(event) => setForm({ ...form, applicationProcedure: event.target.value })} /></label><label>Organization image URL <span className="optional">OPTIONAL</span><input type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="https://" /></label><label>Official application URL<input required type="url" value={form.applicationLink} onChange={(event) => setForm({ ...form, applicationLink: event.target.value })} placeholder="https://" /></label><div className="form-actions"><button className="button button-lime">{editing ? 'Save changes' : 'Publish opportunity'} <ArrowUpRight size={16} /></button>{editing && <button type="button" className="button button-outline-dark" onClick={() => { setEditing(''); setForm(emptyOpportunity); }}>Cancel edit <X size={15} /></button>}</div>{notice && <p className="success-note">{notice}</p>}</div></form><section className="deadline-panel admin-list-panel"><div className="deadline-panel-heading"><div><span className="eyebrow">CURRENT LISTINGS</span><h2>On the board.</h2></div></div>{busy ? <Loading /> : items.length ? items.map((item) => <div className="admin-manage-row" key={item._id}><div><strong>{item.title}</strong><span>{item.organization} · {item.category}</span><small>Closes {dateLabel(item.deadline)}</small></div><div className="admin-row-actions"><button className="icon-button" onClick={() => edit(item)} aria-label={`Edit ${item.title}`} title="Edit listing"><Pencil size={15} /></button><button className="icon-button danger-icon" onClick={() => remove(item._id)} aria-label={`Delete ${item.title}`} title="Delete listing"><Trash2 size={16} /></button></div></div>) : <p className="muted-copy">No listings yet.</p>}</section></div></div>;
}

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  useEffect(() => { api.get('/admin/reports').then(({ data }) => setReports(data)).catch((cause) => setError(errorText(cause))).finally(() => setBusy(false)); }, []);
  const update = async (id, status) => {
    try { const { data } = await api.patch(`/admin/reports/${id}`, { status }); setReports((current) => current.map((report) => report._id === id ? { ...report, status: data.status } : report)); }
    catch (cause) { setError(errorText(cause)); }
  };
  return <div className="page-stack"><PageHeading eyebrow="LISTING MODERATION" title="Keep the board trustworthy." copy="Review student reports and close the loop on inaccurate listings." /><ErrorBanner message={error} />{busy ? <Loading /> : reports.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>REASON</th><th>LISTING</th><th>REPORTED BY</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>{reports.map((report) => <tr key={report._id}><td><strong className="student-name">{report.reason}</strong><span className="table-subtitle">{report.details || 'No additional details'}</span></td><td>{report.opportunityId?.title || 'Listing removed'}<span className="table-subtitle">{report.opportunityId?.organization || ''}</span></td><td>{report.studentId?.name || 'Student account'}</td><td>{dateLabel(report.createdAt)}</td><td><select className="table-select" aria-label={`Update report ${report._id}`} value={report.status} onChange={(event) => update(report._id, event.target.value)}>{['Open', 'Reviewed', 'Resolved'].map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div> : <EmptyState icon={CircleAlert} title="No reports to review" copy="Student-submitted listing reports will appear here." />}</div>;
}

function AdminStudents() {
  const [students, setStudents] = useState([]); const [error, setError] = useState(''); const [busy, setBusy] = useState(true);
  useEffect(() => { api.get('/admin/students').then(({ data }) => setStudents(data)).catch((cause) => setError(errorText(cause))).finally(() => setBusy(false)); }, []);
  return <div className="page-stack"><PageHeading eyebrow="STUDENT NETWORK" title="People making moves." copy="Students who have joined the OpportunityHub community." /><ErrorBanner message={error} />{busy ? <Loading /> : students.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>STUDENT</th><th>COLLEGE</th><th>DEPARTMENT</th><th>YEAR</th><th>JOINED</th></tr></thead><tbody>{students.map((student) => <tr key={student._id}><td><strong className="student-name">{student.name}</strong><span className="table-subtitle">{student.email}</span></td><td>{student.college || '—'}</td><td>{student.department || '—'}</td><td>{student.year || '—'}</td><td>{dateLabel(student.createdAt)}</td></tr>)}</tbody></table></div> : <EmptyState icon={Users} title="The network is just getting started" copy="Student accounts will show up here once they register." />}</div>;
}

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    api.get('/admin/applications').then(({ data }) => setApplications(data)).catch((cause) => setError(errorText(cause))).finally(() => setBusy(false));
  }, []);
  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/applications/${id}/status`, { status });
      setApplications((current) => current.map((application) => application._id === id ? { ...application, status: data.status } : application));
    } catch (cause) { setError(errorText(cause)); }
  };
  return <div className="page-stack"><PageHeading eyebrow="APPLICATION REVIEW" title="Support the next step." copy="Review student applications and keep their status up to date." /><ErrorBanner message={error} />{busy ? <Loading /> : applications.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>STUDENT</th><th>OPPORTUNITY</th><th>APPLIED</th><th>STATUS</th></tr></thead><tbody>{applications.filter((application) => application.studentId && application.opportunityId).map((application) => <tr key={application._id}><td><strong className="student-name">{application.studentId.name}</strong><span className="table-subtitle">{application.studentId.email}</span></td><td><strong className="student-name">{application.opportunityId.title}</strong><span className="table-subtitle">{application.opportunityId.organization}</span></td><td>{dateLabel(application.appliedAt)}</td><td><select className="table-select" aria-label={`Update status for ${application.studentId.name}`} value={application.status} onChange={(event) => updateStatus(application._id, event.target.value)}>{['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'].map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div> : <EmptyState icon={BriefcaseBusiness} title="No applications to review" copy="Student applications will appear here as they come in." />}</div>;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <Loading />;
  return <Routes><Route path="/" element={<Landing />} /><Route path="/auth" element={<AuthPage />} /><Route path="/reset-password/:token" element={<ResetPassword />} /><Route element={<AppFrame />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/explore" element={<Explore />} /><Route path="/saved" element={<SavedPage />} /><Route path="/applications" element={<ApplicationsPage />} /><Route path="/notifications" element={<NotificationsPage />} /><Route path="/profile" element={<ProfileRoute />} /></Route><Route element={<AnyRoleFrame />}><Route path="/opportunities/:id" element={<OpportunityPage />} /></Route><Route element={<AppFrame admin />}><Route path="/admin" element={<AdminDashboard />} /><Route path="/admin/opportunities" element={<AdminOpportunities />} /><Route path="/admin/applications" element={<AdminApplications />} /><Route path="/admin/reports" element={<AdminReports />} /><Route path="/admin/students" element={<AdminStudents />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
