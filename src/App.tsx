import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight, BarChart3, Bell, BookOpen, Bot, CalendarDays, Check, ChevronDown,
  CircleHelp, Compass, FileText, GraduationCap, LayoutDashboard, Lightbulb, LogOut,
  Menu, MessageSquareText, MoreHorizontal, Plus, Search, Settings2, Sparkles, Target,
  Trophy, X, Zap, Filter, Star, Globe, DollarSign, Award, Send, Trash2, Pencil, XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { universities, allCountries, allMajors } from '@/data/universities';
import type { University } from '@/data/universities';
import { defaultProfile, getProfileInitials, getAvatarColor } from '@/lib/types';
import type { StudentProfile } from '@/lib/types';
import { analyzeProfile, generateAdvisorResponse, generateRoadmap } from '@/lib/advisor';
import type { AdvisorMessage } from '@/lib/advisor';

type View = 'Overview' | 'Universities' | 'Roadmap' | 'Applications' | 'Scholarships' | 'Essays';
type AuthUser = { id: string; email: string } | null;

type Application = {
  id: string;
  school: string;
  program: string;
  deadline: string;
  status: string;
  progress: number;
  initials: string;
  color: string;
};

type Essay = {
  id: string;
  title: string;
  type: string;
  content: string;
  wordLimit: number;
  updated: string;
};

type SavedScholarship = string[];

const navItems: { label: View; icon: typeof LayoutDashboard }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Universities', icon: GraduationCap },
  { label: 'Roadmap', icon: Compass },
  { label: 'Applications', icon: FileText },
  { label: 'Scholarships', icon: Trophy },
  { label: 'Essays', icon: BookOpen },
];

function App() {
  const [activeView, setActiveView] = useState<View>('Overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [user, setUser] = useState<AuthUser>(null);
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savedSchools, setSavedSchools] = useState<string[]>(['University of Toronto']);
  const [applications, setApplications] = useState<Application[]>([
    { id: 'a1', school: 'University of Toronto', program: 'Computer Science · Early Action', deadline: 'Oct 31, 2024', status: 'In progress', progress: 68, initials: 'UT', color: '#1359b5' },
    { id: 'a2', school: 'University of Amsterdam', program: 'BSc Artificial Intelligence', deadline: 'Jan 15, 2025', status: 'Shortlisted', progress: 42, initials: 'UA', color: '#d64f37' },
    { id: 'a3', school: 'Georgia Institute of Technology', program: 'Computational Media', deadline: 'Jan 4, 2025', status: 'Researching', progress: 18, initials: 'GT', color: '#a28b00' },
  ]);
  const [essays, setEssays] = useState<Essay[]>([
    { id: 'e1', title: 'Why Computer Science?', type: 'Personal statement', content: 'I remember the first time I made a computer do something I told it to. I was twelve, and I had just written my first line of Python...', wordLimit: 650, updated: 'Edited today' },
    { id: 'e2', title: 'Community impact essay', type: 'Supplemental · Toronto', content: 'When I started tutoring math at the local community center, I didn\'t expect to learn more than my students...', wordLimit: 250, updated: 'Edited Sep 8' },
  ]);
  const [savedScholarships, setSavedScholarships] = useState<SavedScholarship>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser({ id: data.session.user.id, email: data.session.user.email || '' });
        const meta = data.session.user.user_metadata as Record<string, unknown> | null;
        if (meta?.fullName) {
          setProfile((p) => ({ ...p, fullName: meta.fullName as string, email: data.session.user.email || '' }));
        }
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          const meta = session.user.user_metadata as Record<string, unknown> | null;
          if (meta?.fullName) setProfile((p) => ({ ...p, fullName: meta.fullName as string }));
        } else {
          setUser(null);
        }
      })();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = (email: string, fullName?: string) => {
    setShowAuth(false);
    setProfile((p) => ({ ...p, email, fullName: fullName || p.fullName }));
    setShowOnboarding(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveView('Overview');
  };

  const handleOnboardingComplete = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    setShowOnboarding(false);
    setActiveView('Overview');
  };

  const toggleSaved = (name: string) => {
    setSavedSchools((c) => (c.includes(name) ? c.filter((s) => s !== name) : [...c, name]));
  };

  const addToTracker = (uni: University) => {
    if (applications.some((a) => a.school === uni.name)) return;
    const initials = uni.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    setApplications((c) => [
      ...c,
      {
        id: `a${Date.now()}`,
        school: uni.name,
        program: uni.majors[0] || 'Undeclared',
        deadline: 'Jan 15, 2025',
        status: 'Researching',
        progress: 5,
        initials,
        color: getAvatarColor(uni.name),
      },
    ]);
  };

  const advanceApplication = (id: string) => {
    setApplications((c) =>
      c.map((a) =>
        a.id === id
          ? {
              ...a,
              progress: Math.min(a.progress + 15, 100),
              status: a.progress + 15 >= 100 ? 'Complete' : a.progress + 15 >= 60 ? 'In progress' : a.status,
            }
          : a
      )
    );
  };

  const removeApplication = (id: string) => {
    setApplications((c) => c.filter((a) => a.id !== id));
  };

  const analysis = useMemo(() => analyzeProfile(profile), [profile]);
  const roadmap = useMemo(() => generateRoadmap(profile), [profile]);

  const initials = getProfileInitials(profile.fullName);
  const avatarColor = getAvatarColor(profile.fullName);

  if (!user) {
    return <Landing onSignUp={() => { setAuthMode('signup'); setShowAuth(true); }} onLogin={() => { setAuthMode('login'); setShowAuth(true); }} showAuth={showAuth} authMode={authMode} setAuthMode={setAuthMode} closeAuth={() => setShowAuth(false)} onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={17} strokeWidth={2.5} /></div>
          <span>student<span className="brand-os">OS</span></span>
        </div>
        <div className="workspace-switcher">
          <div className="avatar" style={{ background: avatarColor + '22', color: avatarColor }}>{initials}</div>
          <div className="workspace-copy">
            <strong>{user ? profile.fullName : 'Guest'}</strong>
            <span>{user ? profile.grade : 'Sign in to save progress'}</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="sidebar-label">Workspace</div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeView === label ? 'active' : ''}`} onClick={() => { setActiveView(label); setMobileOpen(false); }}>
              <Icon size={17} /><span>{label}</span>
              {label === 'Applications' && <span className="nav-count">{applications.length}</span>}
              {label === 'Universities' && <span className="nav-count">{universities.length}+</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-label sidebar-label-later">Your toolkit</div>
        <nav className="main-nav">
          <button className="nav-item" onClick={() => setShowAdvisor(true)}><Bot size={17} /><span>AI Advisor</span><span className="new-pill">NEW</span></button>
          <button className="nav-item" onClick={() => setActiveView('Overview')}><Target size={17} /><span>Profile score</span></button>
          <button className="nav-item"><BarChart3 size={17} /><span>Insights</span></button>
        </nav>
        <div className="sidebar-bottom">
          {!user ? (
            <div className="upgrade-card">
              <div className="upgrade-icon"><Zap size={16} /></div>
              <strong>Sign in to unlock</strong>
              <p>Save your progress, get personalized plans, and track applications.</p>
              <button onClick={() => { setAuthMode('signup'); setShowAuth(true); }}>Create free account <ArrowUpRight size={13} /></button>
            </div>
          ) : (
            <div className="upgrade-card signed-in">
              <div className="upgrade-icon"><Check size={16} /></div>
              <strong>Signed in</strong>
              <p>{profile.email}</p>
              <button onClick={handleSignOut}><LogOut size={13} /> Sign out</button>
            </div>
          )}
          <button className="nav-item"><Settings2 size={17} /><span>Settings</span></button>
          <button className="nav-item help-item"><CircleHelp size={17} /><span>Help center</span><span className="shortcut">?</span></button>
        </div>
      </aside>
      {mobileOpen && <button className="mobile-overlay" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeView}</strong></div>
          <div className="topbar-actions">
            {!user && <button className="signin-button" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>Sign in</button>}
            <button className="icon-button"><Bell size={18} /><i /></button>
            <div className="top-avatar avatar" style={{ background: avatarColor + '22', color: avatarColor }}>{initials}</div>
          </div>
        </header>
        {activeView === 'Overview' && <Overview profile={profile} analysis={analysis} onView={setActiveView} onAdvisor={() => setShowAdvisor(true)} applications={applications} onComplete={advanceApplication} user={user} onSignIn={() => { setAuthMode('signup'); setShowAuth(true); }} />}
        {activeView === 'Universities' && <UniversityFinder savedSchools={savedSchools} onToggleSaved={toggleSaved} onAddToTracker={addToTracker} trackedSchools={applications.map((a) => a.school)} />}
        {activeView === 'Roadmap' && <Roadmap profile={profile} roadmap={roadmap} analysis={analysis} />}
        {activeView === 'Applications' && <Applications items={applications} onComplete={advanceApplication} onRemove={removeApplication} onAdd={() => setActiveView('Universities')} />}
        {activeView === 'Scholarships' && <Scholarships savedScholarships={savedScholarships} onToggleSave={(name) => setSavedScholarships((c) => c.includes(name) ? c.filter((s) => s !== name) : [...c, name])} />}
        {activeView === 'Essays' && <Essays essays={essays} setEssays={setEssays} />}
      </main>
      {showAdvisor && <Advisor onClose={() => setShowAdvisor(false)} profile={profile} />}
      {showAuth && <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
      {showOnboarding && <Onboarding profile={profile} onComplete={handleOnboardingComplete} />}
    </div>
  );
}

function Overview({ profile, analysis, onView, onAdvisor, applications, onComplete, user, onSignIn }: {
  profile: StudentProfile; analysis: ReturnType<typeof analyzeProfile>; onView: (v: View) => void; onAdvisor: () => void;
  applications: Application[]; onComplete: (id: string) => void; user: AuthUser; onSignIn: () => void;
}) {
  const firstName = profile.fullName.split(' ')[0];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const nextDeadline = applications.length > 0 ? applications[0] : null;
  const daysLeft = nextDeadline ? Math.max(0, Math.ceil((new Date(nextDeadline.deadline).getTime() - Date.now()) / 86400000)) : 0;
  const completedTasks = applications.filter((a) => a.progress >= 100).length;
  const scoreBars = [
    { label: 'Academics', value: analysis.scores.academics, color: 'blue' },
    { label: 'SAT', value: analysis.scores.sat, color: 'blue' },
    { label: 'Projects', value: analysis.scores.projects, color: 'blue' },
    { label: 'Leadership', value: analysis.scores.leadership, color: 'orange' },
    { label: 'Research', value: analysis.scores.research, color: 'orange' },
    { label: 'Olympiads', value: analysis.scores.olympiads, color: 'red' },
  ];

  return (
    <div className="page-wrap page-fade">
      <section className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> {today}</div>
          <h1>Good morning, {firstName}<span className="serif-dot">.</span></h1>
          <p className="subtitle">You're building a profile that stands out. Here's your next best move.</p>
        </div>
        <button className="primary-button" onClick={onAdvisor}><Sparkles size={16} /> Ask your advisor</button>
      </section>

      {!user && (
        <section className="hero-insight" style={{ cursor: 'pointer' }} onClick={onSignIn}>
          <div className="insight-glow" />
          <div className="insight-icon"><Sparkles size={20} /></div>
          <div className="insight-content">
            <div className="insight-label">Welcome to StudentOS <span>• Create your free account</span></div>
            <h2>Unlock your personalized admissions plan</h2>
            <p>Sign up to get a custom roadmap, AI advisor guidance, and track your applications across <strong>{universities.length}+ universities</strong>.</p>
            <button className="text-button">Get started free <ArrowUpRight size={15} /></button>
          </div>
          <div className="insight-progress"><div className="progress-ring"><span>{analysis.overall}</span><small>/100</small></div><span>Est. score</span></div>
        </section>
      )}

      {user && (
        <section className="hero-insight">
          <div className="insight-glow" />
          <div className="insight-icon"><Sparkles size={20} /></div>
          <div className="insight-content">
            <div className="insight-label">Your next best move <span>• Personalized for you</span></div>
            <h2>{analysis.weaknesses[0] === 'research' ? 'Strengthen your research profile' : analysis.weaknesses[0] === 'olympiads' ? 'Add an Olympiad to your portfolio' : 'Focus on ' + analysis.weaknesses[0]}</h2>
            <p>Your biggest opportunity is in <strong>{analysis.weaknesses[0]}</strong>. Improving this area will raise your profile score the most.</p>
            <button className="text-button" onClick={() => onView('Roadmap')}>See your plan <ArrowUpRight size={15} /></button>
          </div>
          <div className="insight-progress"><div className="progress-ring"><span>{analysis.overall}</span><small>/100</small></div><span>Profile score</span></div>
        </section>
      )}

      <section className="metrics-grid">
        <Metric icon={<Target size={17} />} label="Profile score" value={`${analysis.overall}`} change="Out of 100" accent="blue" />
        <Metric icon={<CalendarDays size={17} />} label="Days to deadline" value={nextDeadline ? `${daysLeft}` : '—'} change={nextDeadline ? nextDeadline.school : 'No deadlines'} accent="orange" />
        <Metric icon={<Trophy size={17} />} label="Your percentile" value={`Top ${Math.max(100 - analysis.overall - 10, 5)}%`} change="Among similar profiles" accent="green" />
        <Metric icon={<Check size={17} />} label="Applications" value={`${applications.length}`} change={`${completedTasks} complete`} accent="slate" />
      </section>

      <div className="section-heading">
        <div><h2>Focus this week</h2><p>Small steps compound into an extraordinary application.</p></div>
        <button className="subtle-button" onClick={() => onView('Roadmap')}>View roadmap <ArrowUpRight size={14} /></button>
      </div>
      <section className="focus-grid">
        <div className="task-card">
          <div className="task-card-top"><span className="card-kicker">Priority tasks</span><MoreHorizontal size={18} /></div>
          <Task title="Complete SAT Math practice set" meta="SAT · 45 min" done />
          <Task title="Outline your research question" meta="Research · 30 min" />
          <Task title="Draft activities description" meta="Applications · 20 min" />
          <Task title="Find one summer program" meta="Opportunities · 15 min" />
        </div>
        <div className="score-card">
          <div className="task-card-top"><span className="card-kicker">Profile breakdown</span><button className="mini-link" onClick={() => onView('Roadmap')}>Improve score <ArrowUpRight size={13} /></button></div>
          <div className="score-row">
            <div className="large-score">{analysis.overall}<small>/100</small></div>
            <div className="score-copy"><strong>{analysis.overall >= 80 ? 'Exceptional' : analysis.overall >= 65 ? 'Strong foundation' : 'Building momentum'}</strong><span>{analysis.weaknesses.length} areas with biggest upside</span></div>
          </div>
          {scoreBars.map((s) => <ScoreBar key={s.label} label={s.label} value={s.value} color={s.color} />)}
        </div>
      </section>

      <div className="section-heading applications-heading">
        <div><h2>Application tracker</h2><p>Stay ahead of every moving piece.</p></div>
        <button className="subtle-button" onClick={() => onView('Applications')}>See all <ArrowUpRight size={14} /></button>
      </div>
      <section className="application-list">
        {applications.slice(0, 3).map((a) => <ApplicationRow key={a.id} application={a} onComplete={() => onComplete(a.id)} />)}
      </section>

      <section className="bottom-grid">
        <div className="recommendation-card">
          <div className="recommendation-orb"><Lightbulb size={22} /></div>
          <div>
            <span className="card-kicker">Recommended for you</span>
            <h3>Global STEM Challenge</h3>
            <p>International · Deadline in 12 days</p>
            <button className="text-button" onClick={onAdvisor}>Ask advisor about this <ArrowUpRight size={14} /></button>
          </div>
          <div className="match-score">94%<small>match</small></div>
        </div>
        <div className="quote-card">
          <MessageSquareText size={18} />
          <p>"The best applications don't try to be impressive. They try to be <em>specific.</em>"</p>
          <span>— StudentOS Advisor</span>
        </div>
      </section>
    </div>
  );
}

function Landing({ onSignUp, onLogin, showAuth, authMode, setAuthMode, closeAuth, onAuthSuccess }: { onSignUp: () => void; onLogin: () => void; showAuth: boolean; authMode: 'login' | 'signup'; setAuthMode: (mode: 'login' | 'signup') => void; closeAuth: () => void; onAuthSuccess: (email: string, fullName?: string) => void }) {
  const [activeTab, setActiveTab] = useState<'plan' | 'finder' | 'advisor'>('plan');
  return <div className="landing-page">
    <nav className="landing-nav">
      <div className="landing-brand"><div className="brand-mark"><Sparkles size={17} strokeWidth={2.5} /></div><span>student<span className="brand-os">OS</span></span></div>
      <div className="landing-nav-links"><a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#stories">Stories</a></div>
      <div className="landing-nav-actions"><button className="landing-login" onClick={onLogin}>Log in</button><button className="landing-nav-cta" onClick={onSignUp}>Get your plan <ArrowUpRight size={14} /></button></div>
    </nav>
    <main>
      <section className="landing-hero">
        <div className="hero-copy">
          <div className="landing-pill"><span className="pulse-dot" /> The admissions operating system for ambitious students</div>
          <h1>Build a future<br /><em>you can get into.</em></h1>
          <p className="landing-lede">StudentOS turns your goals into a clear, personalized path to university — from the first SAT practice to the final application.</p>
          <div className="landing-hero-actions"><button className="landing-primary" onClick={onSignUp}>Build my admissions plan <ArrowUpRight size={16} /></button><button className="landing-play" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}><span className="play-icon">▶</span> See how it works</button></div>
          <div className="hero-proof"><div className="avatar-stack"><span>AR</span><span>JM</span><span>SK</span><span>+</span></div><div><strong>Built for the next 100,000</strong><small>students building their edge</small></div></div>
        </div>
        <div className="hero-product-shot">
          <div className="shot-glow" />
          <div className="shot-window"><div className="shot-bar"><div className="shot-dots"><i /><i /><i /></div><span>studentOS / workspace</span><span className="shot-live">LIVE</span></div><div className="shot-body"><div className="shot-sidebar"><div className="shot-logo"><Sparkles size={9} /></div><i /><i /><i /><i /><i /></div><div className="shot-main"><div className="shot-greeting"><small>YOUR NEXT BEST MOVE</small><strong>Strengthen your research profile.</strong><span>Your profile is 68% complete. One focused project could move you into the top 10%.</span></div><div className="shot-metrics"><div><small>PROFILE SCORE</small><b>68<span>/100</span></b><i>+8 this month</i></div><div><small>UNIVERSITIES</small><b>520<span>+</span></b><i>matched to you</i></div><div><small>NEXT DEADLINE</small><b>51<span> days</span></b><i>Toronto · Early Action</i></div></div><div className="shot-bottom"><div className="shot-chart"><div className="shot-title">Your profile breakdown <span>See insights ↗</span></div><div className="chart-lines"><i style={{ width: '76%' }} /><i style={{ width: '68%' }} /><i style={{ width: '55%' }} /><i style={{ width: '42%' }} /></div><div className="chart-labels"><span>Academics</span><span>SAT</span><span>Research</span><span>Olympiads</span></div></div><div className="shot-ai"><div><Bot size={12} /><small>AI ADVISOR</small></div><strong>“Focus on one<br />research project.”</strong><span>See your plan ↗</span></div></div></div></div></div>
          <div className="floating-score"><div className="floating-score-ring">94</div><div><small>BEST MATCH</small><strong>University of Toronto</strong><span>Computer Science · 94% fit</span></div></div>
        </div>
      </section>
      <section className="landing-trust"><span>One workspace for the whole journey</span><div><strong>500+</strong> universities</div><div><strong>1,200+</strong> scholarships</div><div><strong>24/7</strong> personal guidance</div></section>
      <section className="landing-section" id="how-it-works"><div className="section-intro"><div className="landing-eyebrow">THE DIFFERENCE IS DIRECTION</div><h2>Stop guessing.<br /><em>Start building.</em></h2><p>Most students collect advice. StudentOS turns it into momentum.</p></div><div className="landing-tabs"><div className="tab-buttons">{(['plan', 'finder', 'advisor'] as const).map((tab, i) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}><span>0{i + 1}</span>{tab === 'plan' ? 'Know your edge' : tab === 'finder' ? 'Find your fit' : 'Make better moves'}</button>)}</div><div className="tab-content">{activeTab === 'plan' && <><div className="tab-number">01</div><div><h3>Your profile, finally in one place.</h3><p>See exactly what makes you competitive — and what to improve next. Your academic profile, activities, projects, research, and goals become one clear picture.</p><button onClick={onSignUp}>Calculate my profile score <ArrowUpRight size={14} /></button></div></>}{activeTab === 'finder' && <><div className="tab-number">02</div><div><h3>Find the schools that fit your story.</h3><p>Compare 500+ universities by major, tuition, acceptance rate, SAT range, scholarships, and your personalized likelihood of admission.</p><button onClick={onSignUp}>Explore your best matches <ArrowUpRight size={14} /></button></div></>}{activeTab === 'advisor' && <><div className="tab-number">03</div><div><h3>Never wonder what to do next.</h3><p>Ask your AI advisor anything about universities, scholarships, research, competitions, or essays. Get a specific answer based on your profile.</p><button onClick={onSignUp}>Meet your advisor <ArrowUpRight size={14} /></button></div></>}</div></div></section>
      <section className="landing-section feature-section" id="features"><div className="landing-eyebrow">ONE SYSTEM. EVERY ADVANTAGE.</div><div className="feature-heading"><h2>Everything your future<br />needs to <em>move forward.</em></h2><p>Replace scattered tabs, generic advice, and late-night uncertainty with a system designed around how great applications are actually built.</p></div><div className="feature-grid"><FeatureCard icon={<Compass size={20} />} number="01" title="Personalized roadmap" text="A month-by-month plan built around your grade, major, goals, and actual starting point." /><FeatureCard icon={<GraduationCap size={20} />} number="02" title="University finder" text="500+ universities, ranked by fit — not just reputation. See your real best choices." /><FeatureCard icon={<Sparkles size={20} />} number="03" title="AI admissions advisor" text="A 24/7 mentor that knows your profile and gives advice you can act on today." /><FeatureCard icon={<FileText size={20} />} number="04" title="Application command center" text="Deadlines, essays, documents, and progress in one calm, focused workspace." /></div></section>
      <section className="landing-quote" id="stories"><div className="quote-mark">“</div><blockquote>StudentOS gave me something I didn’t know I was missing: <em>a way to see the next step.</em> I stopped comparing myself to everyone else and started building my own story.</blockquote><div className="quote-author"><div className="quote-avatar">JM</div><div><strong>Jaya Mehta</strong><span>Class of 2025 · Computer Science</span></div></div></section>
      <section className="landing-final"><div className="landing-eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h2>The students who stand out<br />are the ones who <em>start early.</em></h2><p>Build a profile that feels like you — and a plan that gets you there.</p><button className="landing-primary" onClick={onSignUp}>Create my free plan <ArrowUpRight size={16} /></button><small>No credit card. No generic advice. Just your next best move.</small></section>
    </main>
    <footer className="landing-footer"><div className="landing-brand"><div className="brand-mark"><Sparkles size={15} /></div><span>student<span className="brand-os">OS</span></span></div><span>Built for students with somewhere to go.</span><div><a href="#features">Product</a><a href="#stories">Stories</a><button onClick={onLogin}>Log in</button></div></footer>
    {showAuth && <AuthModal mode={authMode} setMode={setAuthMode} onClose={closeAuth} onSuccess={onAuthSuccess} />}
  </div>;
}

function FeatureCard({ icon, number, title, text }: { icon: React.ReactNode; number: string; title: string; text: string }) { return <article className="feature-card"><div className="feature-card-top"><div className="feature-icon">{icon}</div><span>{number}</span></div><h3>{title}</h3><p>{text}</p><ArrowUpRight className="feature-arrow" size={16} /></article>; }

function Metric({ icon, label, value, change, accent }: { icon: React.ReactNode; label: string; value: string; change: string; accent: string }) {
  return <div className="metric-card"><div className={`metric-icon ${accent}`}>{icon}</div><span className="metric-label">{label}</span><strong>{value}</strong><span className="metric-change">{change}</span></div>;
}

function Task({ title, meta, done = false }: { title: string; meta: string; done?: boolean }) {
  const [complete, setComplete] = useState(done);
  return (
    <button className={`task-row ${complete ? 'task-done' : ''}`} onClick={() => setComplete(!complete)}>
      <span className="check-circle">{complete && <Check size={12} />}</span>
      <span className="task-text"><strong>{title}</strong><small>{meta}</small></span>
      <ArrowUpRight size={14} className="task-arrow" />
    </button>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="score-bar-row"><span>{label}</span><div className="score-track"><div className={`score-fill ${color}`} style={{ width: `${value}%` }} /></div><strong>{value}</strong></div>;
}

function ApplicationRow({ application, onComplete, onRemove }: { application: Application; onComplete: () => void; onRemove?: () => void }) {
  return (
    <div className="application-row">
      <div className="school-logo" style={{ background: application.color }}>{application.initials}</div>
      <div className="application-name"><strong>{application.school}</strong><span>{application.program}</span></div>
      <div className="deadline"><span>Deadline</span><strong>{application.deadline}</strong></div>
      <div className="application-status"><span className={`status-dot ${application.status === 'Researching' ? 'gray' : application.status === 'Shortlisted' ? 'blue-dot' : ''}`} />{application.status}</div>
      <div className="application-progress">
        <div className="progress-label"><span>Progress</span><strong>{application.progress}%</strong></div>
        <div className="progress-track"><div style={{ width: `${application.progress}%` }} /></div>
      </div>
      <button className="row-action" onClick={onComplete} title="Advance progress">{application.progress >= 100 ? <Check size={15} /> : <ArrowUpRight size={15} />}</button>
      {onRemove && <button className="row-action remove" onClick={onRemove} title="Remove"><X size={15} /></button>}
    </div>
  );
}

// University Finder with 500+ universities and working filters
function UniversityFinder({ savedSchools, onToggleSaved, onAddToTracker, trackedSchools }: {
  savedSchools: string[]; onToggleSaved: (name: string) => void; onAddToTracker: (uni: University) => void; trackedSchools: string[];
}) {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [majorFilter, setMajorFilter] = useState('All');
  const [maxTuition, setMaxTuition] = useState(70000);
  const [maxAcceptance, setMaxAcceptance] = useState(100);
  const [scholarshipOnly, setScholarshipOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rank' | 'tuition' | 'acceptance'>('rank');
  const [visibleCount, setVisibleCount] = useState(24);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = universities.filter((u) => {
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.city.toLowerCase().includes(search.toLowerCase()) || u.country.toLowerCase().includes(search.toLowerCase());
      const matchCountry = countryFilter === 'All' || u.country === countryFilter;
      const matchMajor = majorFilter === 'All' || u.majors.includes(majorFilter);
      const matchTuition = u.tuition <= maxTuition;
      const matchAcceptance = u.acceptance <= maxAcceptance;
      const matchScholarship = !scholarshipOnly || u.scholarship;
      return matchSearch && matchCountry && matchMajor && matchTuition && matchAcceptance && matchScholarship;
    });
    result = result.sort((a, b) => {
      if (sortBy === 'rank') return a.rank - b.rank;
      if (sortBy === 'tuition') return a.tuition - b.tuition;
      return a.acceptance - b.acceptance;
    });
    return result;
  }, [search, countryFilter, majorFilter, maxTuition, maxAcceptance, scholarshipOnly, sortBy]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="page-wrap page-fade">
      <section className="page-title-row">
        <div>
          <div className="eyebrow"><GraduationCap size={14} /> Explore {universities.length}+ universities</div>
          <h1>University finder<span className="serif-dot">.</span></h1>
          <p className="subtitle">Find universities where your ambitions and opportunities align.</p>
        </div>
      </section>
      <div className="finder-search">
        <Search size={19} />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setVisibleCount(24); }} placeholder="Search by university, city, or country..." />
        {search && <button className="clear-search" onClick={() => setSearch('')}><X size={16} /></button>}
        <span className="search-shortcut">{filtered.length} results</span>
      </div>
      <div className="filter-row">
        <button className={`filter-chip ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}><Filter size={13} /> Filters {showFilters ? <X size={13} /> : <ChevronDown size={14} />}</button>
        <button className={`filter-chip ${countryFilter !== 'All' ? 'active' : ''}`} onClick={() => { setCountryFilter(countryFilter === 'All' ? 'United States' : 'All'); }}>{countryFilter === 'All' ? 'All countries' : countryFilter} <ChevronDown size={14} /></button>
        <select className="filter-select" value={majorFilter} onChange={(e) => setMajorFilter(e.target.value)}>
          <option value="All">All majors</option>
          {allMajors.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'rank' | 'tuition' | 'acceptance')}>
          <option value="rank">Sort: Rank</option>
          <option value="tuition">Sort: Tuition (low to high)</option>
          <option value="acceptance">Sort: Acceptance (low to high)</option>
        </select>
        <button className={`filter-chip ${scholarshipOnly ? 'active' : ''}`} onClick={() => setScholarshipOnly(!scholarshipOnly)}><Award size={13} /> Scholarships</button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Max tuition: <strong>${maxTuition.toLocaleString()}/yr</strong></label>
            <input type="range" min={5000} max={70000} step={5000} value={maxTuition} onChange={(e) => setMaxTuition(Number(e.target.value))} className="range-slider" />
          </div>
          <div className="filter-group">
            <label>Max acceptance rate: <strong>{maxAcceptance}%</strong></label>
            <input type="range" min={5} max={100} step={5} value={maxAcceptance} onChange={(e) => setMaxAcceptance(Number(e.target.value))} className="range-slider" />
          </div>
          <div className="filter-group">
            <label>Country</label>
            <select className="filter-select full" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="All">All countries</option>
              {allCountries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="outline-button reset-filters" onClick={() => { setCountryFilter('All'); setMajorFilter('All'); setMaxTuition(70000); setMaxAcceptance(100); setScholarshipOnly(false); setSearch(''); }}>Reset all</button>
        </div>
      )}

      <div className="finder-layout">
        <div className="university-results">
          {visible.length === 0 && (
            <div className="empty-state">
              <Search size={32} />
              <h3>No universities match your filters</h3>
              <p>Try widening your search or resetting filters.</p>
              <button className="outline-button" onClick={() => { setCountryFilter('All'); setMajorFilter('All'); setMaxTuition(70000); setMaxAcceptance(100); setScholarshipOnly(false); setSearch(''); }}>Reset filters</button>
            </div>
          )}
          {visible.map((uni) => (
            <UniversityCard
              key={uni.id}
              university={uni}
              saved={savedSchools.includes(uni.name)}
              tracked={trackedSchools.includes(uni.name)}
              onToggleSaved={() => onToggleSaved(uni.name)}
              onAddToTracker={() => onAddToTracker(uni)}
            />
          ))}
          {visibleCount < filtered.length && (
            <button className="load-more" onClick={() => setVisibleCount((c) => c + 24)}>
              Show more ({filtered.length - visibleCount} remaining)
            </button>
          )}
        </div>
        <aside className="finder-sidebar">
          <div className="sidebar-section">
            <span className="card-kicker">Your preferences</span>
            <h3>Personalize results</h3>
            <p>Adjust filters to find schools that fit your goals and budget.</p>
            <label className="preference-label">Intended major</label>
            <select className="select-control full" value={majorFilter} onChange={(e) => setMajorFilter(e.target.value)}>
              <option value="All">All majors</option>
              {allMajors.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <label className="preference-label">Max tuition</label>
            <div className="select-control full">${maxTuition.toLocaleString()}/yr</div>
            <label className="preference-label">Scholarship needed</label>
            <button className={`select-control full ${scholarshipOnly ? 'active' : ''}`} onClick={() => setScholarshipOnly(!scholarshipOnly)}>{scholarshipOnly ? 'Yes, prioritize' : 'No preference'}</button>
          </div>
          <div className="finder-tip">
            <Sparkles size={17} />
            <strong>Pro insight</strong>
            <p>You're browsing {universities.length}+ universities. Save the ones that interest you and add them to your application tracker.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function UniversityCard({ university, saved, tracked, onToggleSaved, onAddToTracker }: {
  university: University; saved: boolean; tracked: boolean; onToggleSaved: () => void; onAddToTracker: () => void;
}) {
  const initials = university.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const color = getAvatarColor(university.name);
  const fitLabel = university.acceptance < 15 ? 'Reach' : university.acceptance < 40 ? 'Match' : 'Safety';
  const fitType = university.acceptance < 15 ? 'amber' : university.acceptance < 40 ? 'blue' : 'green';

  return (
    <article className="university-card">
      <div className="university-card-header">
        <div className="school-logo large" style={{ background: color }}>{initials}</div>
        <div className="uni-title">
          <h3>{university.name}</h3>
          <p>{university.city}, {university.country}</p>
        </div>
        <button className={`save-star ${saved ? 'saved' : ''}`} onClick={onToggleSaved}>
          {saved ? 'Saved' : 'Save'} <Star size={13} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="uni-tag-row">
        <span className={`uni-tag ${fitType}`}>{fitLabel}</span>
        <span className="uni-rank">#{university.rank} Global</span>
        {university.scholarship && <span className="uni-tag green"><Award size={10} /> Scholarships</span>}
      </div>
      <div className="uni-stats">
        <div><span>Tuition</span><strong>${(university.tuition / 1000).toFixed(0)}k/yr</strong></div>
        <div><span>Acceptance</span><strong>{university.acceptance}%</strong></div>
        <div><span>SAT Range</span><strong>{university.satMin}–{university.satMax}</strong></div>
        <div><span>Top Majors</span><strong>{university.majors.slice(0, 2).join(', ')}</strong></div>
      </div>
      <div className="card-actions">
        <button className="outline-button">View profile</button>
        {tracked ? (
          <button className="primary-small tracked" disabled><Check size={14} /> Tracking</button>
        ) : (
          <button className="primary-small" onClick={onAddToTracker}><Plus size={14} /> Add to tracker</button>
        )}
      </div>
    </article>
  );
}

function Roadmap({ profile, roadmap, analysis }: { profile: StudentProfile; roadmap: ReturnType<typeof generateRoadmap>; analysis: ReturnType<typeof analyzeProfile> }) {
  const [completed, setCompleted] = useState<number[]>([0]);
  const [regenerated, setRegenerated] = useState(0);

  const handleRegenerate = () => {
    setCompleted([]);
    setRegenerated((r) => r + 1);
  };

  const overallProgress = Math.round((completed.length / roadmap.length) * 100);

  return (
    <div className="page-wrap page-fade">
      <section className="page-title-row">
        <div>
          <div className="eyebrow"><Compass size={14} /> Your personalized plan</div>
          <h1>Your roadmap<span className="serif-dot">.</span></h1>
          <p className="subtitle">A focused path from where you are to where you want to go.</p>
        </div>
        <button className="primary-button" onClick={handleRegenerate}><Sparkles size={16} /> Regenerate plan</button>
      </section>
      <div className="roadmap-banner">
        <div>
          <span className="card-kicker">Roadmap for {profile.fullName}</span>
          <h2>{profile.intendedMajor} · {profile.grade}</h2>
          <p>Focus area: {analysis.weaknesses[0]} · Target score: {Math.min(analysis.overall + 12, 95)}/100</p>
        </div>
        <div className="roadmap-meta">
          <span>Overall progress</span>
          <strong>{overallProgress}%</strong>
          <div className="progress-track"><div style={{ width: `${overallProgress}%` }} /></div>
        </div>
      </div>
      <div className="roadmap-content">
        <div className="timeline">
          {roadmap.map((item, index) => (
            <div className={`milestone ${completed.includes(index) ? 'completed' : ''}`} key={`${regenerated}-${index}`}>
              <div className={`timeline-node ${item.color}`}>{completed.includes(index) ? <Check size={15} /> : index + 1}</div>
              <div className="milestone-body">
                <div className="milestone-top">
                  <span className="month-label">{item.month}</span>
                  <span className={`milestone-type ${item.color}`}>{item.type}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <button className="milestone-action" onClick={() => setCompleted((c) => c.includes(index) ? c.filter((i) => i !== index) : [...c, index])}>
                  {completed.includes(index) ? <><Check size={14} /> Completed</> : <>Mark complete <ArrowUpRight size={14} /></>}
                </button>
              </div>
            </div>
          ))}
        </div>
        <aside className="roadmap-side">
          <div className="side-card">
            <span className="card-kicker">This month</span>
            <h3>{roadmap[0].month} focus</h3>
            <div className="mini-goal">
              <span className="mini-goal-icon"><BarChart3 size={15} /></span>
              <div><strong>{roadmap[0].title}</strong><span>{roadmap[0].type}</span></div>
            </div>
            <div className="mini-goal">
              <span className="mini-goal-icon green"><Lightbulb size={15} /></span>
              <div><strong>{roadmap[1].title}</strong><span>{roadmap[1].month}</span></div>
            </div>
            <button className="text-button">Open monthly plan <ArrowUpRight size={14} /></button>
          </div>
          <div className="side-card advisor-mini">
            <div className="advisor-mini-icon"><Bot size={18} /></div>
            <h3>Need a different path?</h3>
            <p>Ask your advisor to adjust your roadmap around a new goal.</p>
            <button className="outline-button">Talk to advisor</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Applications({ items, onComplete, onRemove, onAdd }: {
  items: Application[]; onComplete: (id: string) => void; onRemove: (id: string) => void; onAdd: () => void;
}) {
  const avgProgress = items.length > 0 ? Math.round(items.reduce((s, a) => s + a.progress, 0) / items.length) : 0;
  const nextDeadline = items.length > 0 ? items[0] : null;
  const daysLeft = nextDeadline ? Math.max(0, Math.ceil((new Date(nextDeadline.deadline).getTime() - Date.now()) / 86400000)) : 0;

  return (
    <div className="page-wrap page-fade">
      <section className="page-title-row">
        <div>
          <div className="eyebrow"><FileText size={14} /> Your application command center</div>
          <h1>Applications<span className="serif-dot">.</span></h1>
          <p className="subtitle">Every deadline, document, and decision in one calm place.</p>
        </div>
        <button className="primary-button" onClick={onAdd}><Plus size={16} /> Add from universities</button>
      </section>
      <div className="application-summary">
        <div><span>Active applications</span><strong>{items.length}</strong></div>
        <div><span>Average progress</span><strong>{avgProgress}%</strong></div>
        <div><span>Next deadline</span><strong>{nextDeadline ? `${daysLeft} days` : '—'}</strong></div>
        <div className="summary-note"><Sparkles size={16} /><span>{avgProgress >= 50 ? "You're on track for your goals." : 'Keep pushing — every step counts.'}</span></div>
      </div>
      <div className="section-heading compact">
        <div><h2>All applications</h2><p>Click the arrow to advance progress</p></div>
      </div>
      <section className="application-list expanded">
        {items.map((a) => <ApplicationRow key={a.id} application={a} onComplete={() => onComplete(a.id)} onRemove={() => onRemove(a.id)} />)}
      </section>
      {items.length === 0 && (
        <div className="empty-add">
          <div><Plus size={18} /><strong>No applications yet</strong><span>Browse universities and add them to your tracker.</span></div>
          <button className="outline-button" onClick={onAdd}>Browse universities</button>
        </div>
      )}
      {items.length > 0 && (
        <div className="empty-add">
          <div><Plus size={18} /><strong>Track another university</strong><span>Add a school to keep every application detail together.</span></div>
          <button className="outline-button" onClick={onAdd}>Add application</button>
        </div>
      )}
    </div>
  );
}

function Scholarships({ savedScholarships, onToggleSave }: { savedScholarships: string[]; onToggleSave: (name: string) => void }) {
  const scholarships = [
    { title: 'Global STEM Scholars Award', org: 'Future Leaders Foundation', amount: '$25,000', deadline: 'Dec 10, 2024', match: '96%', country: 'Global', tags: ['STEM', 'Merit'] },
    { title: 'Women in Computing Grant', org: 'TechForward', amount: '$8,500', deadline: 'Jan 30, 2025', match: '89%', country: 'Global', tags: ['CS', 'Women'] },
    { title: 'Global Citizen Scholarship', org: 'World Education Trust', amount: '$12,000', deadline: 'Feb 15, 2025', match: '82%', country: 'Global', tags: ['Leadership'] },
    { title: 'International Merit Award', org: 'Global Universities Network', amount: '$15,000', deadline: 'Mar 1, 2025', match: '78%', country: 'Global', tags: ['Merit'] },
    { title: 'Research Excellence Grant', org: 'National Science Foundation', amount: '$5,000', deadline: 'Apr 10, 2025', match: '91%', country: 'United States', tags: ['Research', 'STEM'] },
    { title: 'Young Innovators Scholarship', org: 'Innovation Fund', amount: '$10,000', deadline: 'May 20, 2025', match: '85%', country: 'Global', tags: ['Innovation', 'Projects'] },
    { title: 'Community Impact Award', org: 'Global Impact Trust', amount: '$7,500', deadline: 'Jun 15, 2025', match: '74%', country: 'Global', tags: ['Community'] },
    { title: 'Future Leaders in Engineering', org: 'Engineering Forward', amount: '$20,000', deadline: 'Jul 1, 2025', match: '88%', country: 'Global', tags: ['Engineering'] },
  ];
  const [countryFilter, setCountryFilter] = useState('All');
  const filtered = scholarships.filter((s) => countryFilter === 'All' || s.country === countryFilter);
  const totalFunding = scholarships.reduce((sum, s) => sum + parseInt(s.amount.replace(/[^0-9]/g, '')), 0);

  return (
    <div className="page-wrap page-fade">
      <section className="page-title-row">
        <div>
          <div className="eyebrow"><Trophy size={14} /> Funding your future</div>
          <h1>Scholarships<span className="serif-dot">.</span></h1>
          <p className="subtitle">Opportunities matched to your profile, not a generic list.</p>
        </div>
      </section>
      <div className="scholarship-hero">
        <div>
          <span className="card-kicker">Matched opportunities</span>
          <h2>${totalFunding.toLocaleString()} in potential funding</h2>
          <p>Across {scholarships.length} scholarships that match your goals and profile.</p>
        </div>
        <div className="scholarship-ring"><strong>{scholarships.length}</strong><span>matches</span></div>
      </div>
      <div className="section-heading compact">
        <div><h2>Top matches for you</h2><p>Based on {defaultProfile.intendedMajor}, your grades, and interests.</p></div>
        <select className="filter-select" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
          <option value="All">All regions</option>
          <option value="Global">Global</option>
          <option value="United States">United States</option>
        </select>
      </div>
      <div className="scholarship-list">
        {filtered.map((item) => (
          <article className="scholarship-card" key={item.title}>
            <div className="scholarship-symbol"><Trophy size={18} /></div>
            <div className="scholarship-info">
              <span className="match-label">{item.match} match</span>
              <h3>{item.title}</h3>
              <p>{item.org}</p>
              <div className="scholarship-tags">{item.tags.map((t) => <span key={t} className="scholarship-tag">{t}</span>)}</div>
            </div>
            <div className="scholarship-detail"><span>Value</span><strong>{item.amount}</strong></div>
            <div className="scholarship-detail"><span>Deadline</span><strong>{item.deadline}</strong></div>
            <button className={`save-star ${savedScholarships.includes(item.title) ? 'saved' : ''}`} onClick={() => onToggleSave(item.title)}>
              {savedScholarships.includes(item.title) ? <Check size={15} /> : <Plus size={15} />}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function Essays({ essays, setEssays }: { essays: Essay[]; setEssays: React.Dispatch<React.SetStateAction<Essay[]>> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const updateEssay = (id: string, content: string) => {
    setEssays((e) => e.map((essay) => essay.id === id ? { ...essay, content, updated: 'Edited just now' } : essay));
  };

  const addEssay = () => {
    const newEssay: Essay = {
      id: `e${Date.now()}`,
      title: 'Untitled essay',
      type: 'New essay',
      content: '',
      wordLimit: 650,
      updated: 'Just created',
    };
    setEssays((e) => [...e, newEssay]);
    setEditing(newEssay.id);
  };

  const deleteEssay = (id: string) => {
    setEssays((e) => e.filter((essay) => essay.id !== id));
    if (editing === id) setEditing(null);
  };

  const getFeedback = (essay: Essay) => {
    const words = wordCount(essay.content);
    const feedback: string[] = [];
    if (words < essay.wordLimit * 0.5) feedback.push(`Your essay is ${words} words — consider expanding to get closer to the ${essay.wordLimit}-word limit.`);
    if (/\bpassion\b/gi.test(essay.content)) feedback.push('You use "passion" — try replacing it with a specific moment that shows it instead.');
    if (/\bvery\b|\breally\b|\bamazing\b/gi.test(essay.content)) feedback.push('Remove filler words like "very," "really," or "amazing." Show, don\'t tell.');
    if (essay.content.length > 0 && !/\./.test(essay.content)) feedback.push('Make sure your sentences are complete and properly punctuated.');
    if (feedback.length === 0) feedback.push('Strong draft! Your writing is specific and avoids common clichés. Keep refining the emotional arc.');
    return feedback;
  };

  const editingEssay = essays.find((e) => e.id === editing);

  return (
    <div className="page-wrap page-fade">
      <section className="page-title-row">
        <div>
          <div className="eyebrow"><BookOpen size={14} /> Find your voice</div>
          <h1>Essay center<span className="serif-dot">.</span></h1>
          <p className="subtitle">The strongest part of your application is already in your story.</p>
        </div>
        <button className="primary-button" onClick={addEssay}><Plus size={16} /> New essay</button>
      </section>
      <div className="essay-banner">
        <div className="essay-banner-icon"><Sparkles size={20} /></div>
        <div>
          <span className="card-kicker">Writing insight</span>
          <h2>Specificity is your superpower.</h2>
          <p>Replace generic statements with moments only you could describe.</p>
        </div>
      </div>
      <div className="section-heading compact">
        <div><h2>Your drafts</h2><p>{essays.length} essay{essays.length !== 1 ? 's' : ''}</p></div>
      </div>
      <div className="essay-grid">
        {essays.map((essay) => {
          const progress = Math.min(Math.round((wordCount(essay.content) / essay.wordLimit) * 100), 100);
          return (
            <article className="essay-card" key={essay.id}>
              <div className="essay-card-top">
                <div className="document-icon"><FileText size={17} /></div>
                <div className="essay-actions">
                  <button className="more-button" onClick={() => setEditing(essay.id)} title="Edit"><Pencil size={14} /></button>
                  <button className="more-button" onClick={() => deleteEssay(essay.id)} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
              <span className="essay-type">{essay.type}</span>
              <h3>{essay.title}</h3>
              <div className="essay-progress">
                <div className="progress-label"><span>{wordCount(essay.content)} / {essay.wordLimit} words</span><strong>{progress}%</strong></div>
                <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
              </div>
              <div className="essay-footer">
                <span className="essay-updated">{essay.updated}</span>
                <button className="feedback-button" onClick={() => setShowFeedback(showFeedback === essay.id ? null : essay.id)}>
                  <Sparkles size={12} /> Feedback
                </button>
              </div>
              {showFeedback === essay.id && (
                <div className="essay-feedback">
                  {getFeedback(essay).map((f, i) => <p key={i}>{f}</p>)}
                </div>
              )}
            </article>
          );
        })}
        <button className="new-essay-card" onClick={addEssay}>
          <Plus size={19} /><strong>Start a new essay</strong><span>Turn a blank page into momentum.</span>
        </button>
      </div>

      {editingEssay && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="essay-editor" onClick={(e) => e.stopPropagation()}>
            <div className="essay-editor-header">
              <input
                className="essay-editor-title"
                value={editingEssay.title}
                onChange={(e) => setEssays((es) => es.map((x) => x.id === editingEssay.id ? { ...x, title: e.target.value } : x))}
                placeholder="Essay title"
              />
              <div className="essay-editor-meta">
                <span>{wordCount(editingEssay.content)} / {editingEssay.wordLimit} words</span>
                <button className="close-button" onClick={() => setEditing(null)}><X size={18} /></button>
              </div>
            </div>
            <textarea
              className="essay-editor-text"
              value={editingEssay.content}
              onChange={(e) => updateEssay(editingEssay.id, e.target.value)}
              placeholder="Start writing your essay..."
              autoFocus
            />
            <div className="essay-editor-footer">
              <button className="outline-button" onClick={() => setShowFeedback(showFeedback === editingEssay.id ? null : editingEssay.id)}>
                <Sparkles size={14} /> Get feedback
              </button>
              <button className="primary-button" onClick={() => setEditing(null)}><Check size={15} /> Save</button>
            </div>
            {showFeedback === editingEssay.id && (
              <div className="essay-feedback-panel">
                <strong>AI Feedback</strong>
                {getFeedback(editingEssay).map((f, i) => <p key={i}>{f}</p>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Advisor({ onClose, profile }: { onClose: () => void; profile: StudentProfile }) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      role: 'advisor',
      content: `I'm your personal admissions consultant. I've reviewed your profile:\n\n- **Profile score:** ${analyzeProfile(profile).overall}/100\n- **Strongest areas:** ${analyzeProfile(profile).strengths.join(', ')}\n- **Biggest opportunities:** ${analyzeProfile(profile).weaknesses.join(', ')}\n\nAsk me anything — universities, scholarships, research, competitions, your roadmap, or essays.`,
      suggestions: ['How can I improve my profile score this month?', 'Which universities are my best fit?', 'Help me find a research project.'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: AdvisorMessage = { role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const response = generateAdvisorResponse(text, profile);
      setMessages((m) => [...m, response]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="modal-backdrop">
      <aside className="advisor-panel">
        <div className="advisor-header">
          <div className="advisor-title">
            <div className="advisor-avatar"><Bot size={19} /></div>
            <div>
              <strong>StudentOS Advisor</strong>
              <span><i className="online-dot" /> Analyzing your profile</span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}><X size={19} /></button>
        </div>
        <div className="advisor-body">
          <div className="advisor-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`advisor-message ${msg.role}`}>
                {msg.role === 'advisor' && <div className="advisor-message-icon"><Sparkles size={14} /></div>}
                <div className="advisor-message-content">
                  <p>{msg.content}</p>
                  {msg.suggestions && (
                    <div className="advisor-suggestion-chips">
                      {msg.suggestions.map((s) => (
                        <button key={s} className="advisor-suggestion-chip" onClick={() => send(s)}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="advisor-typing"><span></span><span></span><span></span></div>}
          </div>
        </div>
        <div className="advisor-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask anything about your journey..."
            rows={2}
          />
          <button disabled={!input.trim() || loading} onClick={() => send(input)}>
            <Send size={17} />
          </button>
          <span>StudentOS can make mistakes. Check important information.</span>
        </div>
      </aside>
    </div>
  );
}

function AuthModal({ mode, setMode, onClose, onSuccess }: {
  mode: 'login' | 'signup'; setMode: (m: 'login' | 'signup') => void; onClose: () => void; onSuccess: (email: string, fullName?: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { fullName } },
      });
      if (error) setError(error.message);
      else if (data.user) onSuccess(email, fullName);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else if (data.user) onSuccess(email);
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="auth-modal">
        <button className="close-button auth-close" onClick={onClose}><X size={18} /></button>
        <div className="auth-brand">
          <div className="brand-mark"><Sparkles size={17} /></div>
          student<span>OS</span>
        </div>
        <h2>{mode === 'signup' ? 'Build your unfair advantage.' : 'Welcome back.'}</h2>
        <p>{mode === 'signup' ? 'Join ambitious students building their future with intention.' : 'Your next great move is waiting.'}</p>
        {mode === 'signup' && (
          <>
            <label>Full name</label>
            <input className="auth-input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Rivera" />
          </>
        )}
        <label>Email address</label>
        <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <label>Password</label>
        <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        {error && <div className="auth-error">{error}</div>}
        <button className="auth-submit" onClick={submit} disabled={loading || !email || !password || (mode === 'signup' && !fullName)}>
          {loading ? 'Connecting...' : mode === 'signup' ? 'Create free account' : 'Log in to StudentOS'} {!loading && <ArrowUpRight size={15} />}
        </button>
        <span className="auth-switch">
          {mode === 'signup' ? 'Already have an account?' : 'New to StudentOS?'}
          <button onClick={() => { setError(''); setMode(mode === 'signup' ? 'login' : 'signup'); }}>
            {mode === 'signup' ? 'Log in' : 'Create an account'}
          </button>
        </span>
        <small>By continuing, you agree to our Terms and Privacy Policy.</small>
      </div>
    </div>
  );
}

function Onboarding({ profile, onComplete }: { profile: StudentProfile; onComplete: (p: StudentProfile) => void }) {
  const [step, setStep] = useState(0);
  const [local, setLocal] = useState<StudentProfile>(profile);

  const steps = ['About you', 'Academics', 'Activities', 'Your goals'];
  const majors = allMajors;
  const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const next = () => { if (step < 3) setStep(step + 1); else onComplete(local); };
  const back = () => { if (step > 0) setStep(step - 1); };

  return (
    <div className="modal-backdrop">
      <div className="onboarding-modal">
        <div className="onboarding-progress">
          {steps.map((s, i) => (
            <div key={s} className={`onboarding-step ${i <= step ? 'active' : ''}`}>
              <div className="onboarding-step-dot">{i < step ? <Check size={14} /> : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="onboarding-content">
            <h2>Tell us about yourself</h2>
            <p>This helps us personalize your experience.</p>
            <label>Full name</label>
            <input className="auth-input" value={local.fullName} onChange={(e) => setLocal({ ...local, fullName: e.target.value })} placeholder="Your name" />
            <label>Current grade</label>
            <div className="chip-row">
              {grades.map((g) => <button key={g} className={`chip ${local.grade === g ? 'selected' : ''}`} onClick={() => setLocal({ ...local, grade: g })}>{g}</button>)}
            </div>
            <label>Intended major</label>
            <select className="filter-select full" value={local.intendedMajor} onChange={(e) => setLocal({ ...local, intendedMajor: e.target.value })}>
              {majors.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <label>Country</label>
            <select className="filter-select full" value={local.country} onChange={(e) => setLocal({ ...local, country: e.target.value })}>
              {allCountries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {step === 1 && (
          <div className="onboarding-content">
            <h2>Your academic profile</h2>
            <p>Be honest — this powers your personalized plan.</p>
            <label>GPA (out of 4.0)</label>
            <input className="auth-input" type="number" step="0.1" min="0" max="4" value={local.gpa} onChange={(e) => setLocal({ ...local, gpa: Number(e.target.value) })} />
            <label>SAT Score</label>
            <input className="auth-input" type="number" min="400" max="1600" value={local.satScore} onChange={(e) => setLocal({ ...local, satScore: Number(e.target.value) })} />
            <p className="onboarding-hint">Don't have an SAT score yet? Enter your target or a practice test score.</p>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-content">
            <h2>Your activities</h2>
            <p>List what you're involved in. Add one per line.</p>
            <label>Extracurriculars</label>
            <textarea className="auth-input textarea" value={local.extracurriculars.join('\n')} onChange={(e) => setLocal({ ...local, extracurriculars: e.target.value.split('\n').filter(Boolean) })} placeholder="Coding Club&#10;Volunteer Tutor&#10;Robotics Team" />
            <label>Research experience</label>
            <textarea className="auth-input textarea" value={local.research.join('\n')} onChange={(e) => setLocal({ ...local, research: e.target.value.split('\n').filter(Boolean) })} placeholder="Independent AI study&#10;Lab assistant" />
            <label>Projects</label>
            <textarea className="auth-input textarea" value={local.projects.join('\n')} onChange={(e) => setLocal({ ...local, projects: e.target.value.split('\n').filter(Boolean) })} placeholder="Mobile app for local business" />
            <label>Olympiads / Competitions</label>
            <textarea className="auth-input textarea" value={local.olympiads.join('\n')} onChange={(e) => setLocal({ ...local, olympiads: e.target.value.split('\n').filter(Boolean) })} placeholder="AMC 12 Participant" />
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-content">
            <h2>Your goals</h2>
            <p>What universities are you aiming for? This shapes your roadmap.</p>
            <label>Target universities (one per line)</label>
            <textarea className="auth-input textarea" value={local.targetUniversities.join('\n')} onChange={(e) => setLocal({ ...local, targetUniversities: e.target.value.split('\n').filter(Boolean) })} placeholder="University of Toronto&#10;Georgia Tech&#10;Stanford University" />
            <div className="onboarding-summary">
              <Sparkles size={16} />
              <p>Based on your inputs, your estimated profile score is <strong>{analyzeProfile(local).overall}/100</strong>. Your roadmap will focus on <strong>{analyzeProfile(local).weaknesses[0]}</strong>.</p>
            </div>
          </div>
        )}

        <div className="onboarding-nav">
          {step > 0 && <button className="outline-button" onClick={back}>Back</button>}
          <button className="primary-button" onClick={next}>
            {step < 3 ? <>Continue <ArrowUpRight size={15} /></> : <>Generate my plan <Sparkles size={15} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
