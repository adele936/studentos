import { useMemo, useState } from 'react';
import { ArrowUpRight, Award, BookOpen, Check, ChevronLeft, ExternalLink, Flame, Globe2, Lightbulb, Plus, ShieldCheck, Sparkles, Target, Trophy, X } from 'lucide-react';
import type { University } from '@/data/universities';
type Application = { school: string; program: string; deadline: string; progress: number; initials: string; color: string };

const campusPhotos = [
  'https://images.pexels.com/photos/37762503/pexels-photo-37762503.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/30052431/pexels-photo-30052431.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/31039051/pexels-photo-31039051.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export function UniversityDetail({ university, onClose, onAdd }: { university: University; onClose: () => void; onAdd: () => void }) {
  const initials = university.name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();
  const photo = campusPhotos[university.id % campusPhotos.length];
  return (
    <div className="detail-overlay" role="dialog" aria-modal="true">
      <article className="university-detail">
        <button className="detail-close" onClick={onClose} aria-label="Close university profile"><X size={18} /></button>
        <div className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, #15283ce8, #15283c55), url(${photo})` }}>
          <div className="detail-logo">{initials}</div>
          <div><span className="detail-kicker">University profile</span><h2>{university.name}</h2><p>{university.city}, {university.country} · Global rank #{university.rank}</p></div>
        </div>
        <div className="detail-body">
          <div className="detail-main">
            <div className="verification-note"><ShieldCheck size={17} /><p><strong>Use this as a planning guide.</strong> Figures can change and some estimates are not published by the university. Always confirm requirements, costs, deadlines, scholarships, and test policy on the official university website before applying.</p></div>
            <h3>Why students consider it</h3><p className="detail-description">{university.description}</p>
            <div className="detail-stat-grid"><div><span>Typical tuition</span><strong>${university.tuition.toLocaleString()} / year</strong></div><div><span>Acceptance estimate</span><strong>{university.acceptance}%</strong></div><div><span>SAT reference range</span><strong>{university.satMin}–{university.satMax}</strong></div><div><span>Student enrollment</span><strong>{university.enrollment.toLocaleString()}</strong></div><div><span>Established</span><strong>{university.established}</strong></div><div><span>Popular areas</span><strong>{university.majors.slice(0, 2).join(' · ')}</strong></div></div>
            <h3>Explore before you apply</h3><div className="detail-tags">{university.majors.map((major) => <span key={major}>{major}</span>)}</div>
          </div>
          <aside className="detail-aside"><span className="card-kicker">Next best move</span><h3>Make this school part of your strategy.</h3><p>Save it, add it to your application simulation, and compare it with your other targets.</p><button className="primary-button" onClick={onAdd}><Plus size={15} /> Add to applications</button><a className="official-link" href={university.website} target="_blank" rel="noreferrer">Visit official website <ExternalLink size={14} /></a><small>Official link provided for verification. Admitiy is not affiliated with this university.</small></aside>
        </div>
      </article>
    </div>
  );
}

const activities = [
  ['Research', 'Independent study, lab assistant, literature review, science fair, published paper'],
  ['Technology', 'Open-source project, app development, hackathon, robotics, cybersecurity, web design'],
  ['Leadership', 'Student government, club founder, team captain, peer mentor, event organizer'],
  ['Community', 'Tutoring, food bank, environmental cleanup, accessibility project, nonprofit volunteering'],
  ['Competitions', 'AMC/AIME, USACO, Science Olympiad, debate, Model UN, FIRST Robotics, essay contests'],
  ['Creative', 'Writing, filmmaking, music ensemble, theater, photography, graphic design, podcasting'],
  ['Work & family', 'Part-time work, family business, caregiving, household responsibilities, internships'],
  ['Athletics', 'Varsity sport, club sport, martial arts, dance, coaching, personal fitness leadership'],
];

export function Extracurriculars() {
  const [selected, setSelected] = useState<string[]>(['Research']);
  const [streak, setStreak] = useState(4);
  const points = selected.length * 120 + streak * 25;
  const toggle = (name: string) => setSelected((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);
  return <div className="page-wrap page-fade"><section className="page-title-row"><div><div className="eyebrow"><Trophy size={14} /> Build proof, not padding</div><h1>Activities lab<span className="serif-dot">.</span></h1><p className="subtitle">Turn genuine interests into consistent, measurable evidence of impact.</p></div><div className="xp-badge"><Flame size={16} /> {streak} day streak · {points} XP</div></section><div className="activity-hero"><div><span className="card-kicker">Your activity portfolio</span><h2>Depth beats a crowded list.</h2><p>Choose areas you actually care about, then log the work, results, and people affected.</p></div><div className="activity-level"><strong>Level {Math.min(10, Math.ceil(points / 250))}</strong><span>Profile builder</span><div className="progress-track"><div style={{ width: `${Math.min(100, points % 250 / 2.5)}%` }} /></div></div></div><div className="activity-layout"><div className="activity-grid">{activities.map(([name, examples]) => <button key={name} className={`activity-card ${selected.includes(name) ? 'selected' : ''}`} onClick={() => toggle(name)}><span className="activity-check">{selected.includes(name) ? <Check size={14} /> : <Plus size={14} />}</span><strong>{name}</strong><p>{examples}</p>{selected.includes(name) && <span className="activity-status">In your portfolio</span>}</button>)}</div><aside className="side-card activity-coach"><Lightbulb size={18} /><h3>This week's challenge</h3><p>Spend 45 minutes making one activity more specific: add a number, outcome, or person who benefited.</p><button className="outline-button" onClick={() => setStreak((value) => value + 1)}>Log today's progress <ArrowUpRight size={13} /></button></aside></div></div>;
}

const researchOptions = [
  { title: 'Science fairs and research showcases', detail: 'Present an original investigation through your school, regional, or national science fair. Requirements and dates vary by region.', link: 'https://www.societyforscience.org/isef/' },
  { title: 'Regeneron Science Talent Search', detail: 'A major US research competition for high school seniors. Check the current eligibility and submission rules before planning around it.', link: 'https://www.societyforscience.org/regeneron-sts/' },
  { title: 'NASA citizen science', detail: 'Join real projects using public NASA data, from asteroid hunting to cloud observations. Contributions are open to students and the public.', link: 'https://science.nasa.gov/citizen-science/' },
  { title: 'MIT OpenCourseWare', detail: 'Use university lecture notes and problem sets to build background knowledge before contacting a mentor or designing a project.', link: 'https://ocw.mit.edu/' },
  { title: 'Local university outreach', detail: 'Read faculty pages, identify a specific research match, and send a short, thoughtful email with your preparation and proposed contribution.', link: 'https://www.nationalacademies.org/' },
  { title: 'Kaggle projects', detail: 'Work with real datasets, document your method, and publish a reproducible notebook instead of claiming a result without evidence.', link: 'https://www.kaggle.com/learn' },
];

export function ResearchHub() { const [saved, setSaved] = useState<string[]>([]); return <div className="page-wrap page-fade"><section className="page-title-row"><div><div className="eyebrow"><BookOpen size={14} /> Curiosity into evidence</div><h1>Research desk<span className="serif-dot">.</span></h1><p className="subtitle">Real starting points for learning, building, and sharing work responsibly.</p></div></section><div className="verification-note research-note"><ShieldCheck size={17} /><p>Dates, eligibility, and availability change. Each option links to its organizer or source. Verify the current rules on that official page.</p></div><div className="research-grid">{researchOptions.map((item) => <article className="research-card" key={item.title}><div className="research-icon"><Globe2 size={17} /></div><h3>{item.title}</h3><p>{item.detail}</p><div className="research-actions"><button className={`save-star ${saved.includes(item.title) ? 'saved' : ''}`} onClick={() => setSaved((items) => items.includes(item.title) ? items.filter((x) => x !== item.title) : [...items, item.title])}>{saved.includes(item.title) ? <Check size={14} /> : <Plus size={14} />} {saved.includes(item.title) ? 'Saved' : 'Save'}</button><a href={item.link} target="_blank" rel="noreferrer">Source <ExternalLink size={13} /></a></div></article>)}</div></div>; }

const stages = ['Profile', 'Activities', 'Essays', 'Recommendations', 'Testing', 'Review', 'Submit'];
export function ApplicationSimulator({ application, onClose, onUpdate }: { application: Application; onClose: () => void; onUpdate: (progress: number) => void }) {
  const initial = Math.min(stages.length - 1, Math.floor(application.progress / 16.7)); const [stage, setStage] = useState(initial); const progress = Math.round((stage / (stages.length - 1)) * 100);
  return <div className="detail-overlay"><article className="application-simulator"><button className="detail-close" onClick={onClose}><X size={18} /></button><div className="sim-header"><div className="school-logo large" style={{ background: application.color }}>{application.initials}</div><div><span className="card-kicker">Application workspace</span><h2>{application.school}</h2><p>{application.program} · Deadline {application.deadline}</p></div></div><div className="sim-progress"><div className="progress-track"><div style={{ width: `${progress}%` }} /></div><strong>{progress}% complete</strong></div><div className="sim-steps">{stages.map((item, index) => <button key={item} className={index <= stage ? 'done' : ''} onClick={() => setStage(index)}><span>{index < stage ? <Check size={13} /> : index + 1}</span>{item}</button>)}</div><div className="sim-card"><span className="card-kicker">Step {stage + 1} of {stages.length}</span><h3>{stages[stage]}</h3><p>{stage === 0 ? 'Confirm your name, school history, and intended program.' : stage === 1 ? 'Choose your strongest activities and add measurable impact.' : stage === 2 ? 'Draft your personal statement and school-specific responses.' : stage === 3 ? 'Request recommendations early and share a useful brag sheet.' : stage === 4 ? 'Record your SAT/ACT plan and send scores only where they help.' : stage === 5 ? 'Review every field, date, file, and fee before submitting.' : 'You are ready to submit. Verify everything on the university portal.'}</p><label className="sim-check"><input type="checkbox" checked={stage > 0} onChange={() => undefined} /> Mark this section reviewed</label></div><div className="sim-actions"><button className="outline-button" onClick={() => stage > 0 && setStage(stage - 1)} disabled={stage === 0}><ChevronLeft size={14} /> Back</button><button className="primary-button" onClick={() => { const next = Math.min(stages.length - 1, stage + 1); setStage(next); onUpdate(Math.round((next / (stages.length - 1)) * 100)); }}>{stage === stages.length - 1 ? 'Complete review' : 'Save and continue'} <ArrowUpRight size={14} /></button></div><p className="sim-warning"><ShieldCheck size={14} /> This simulation organizes your work; submit only through the university or Common App portal.</p></article></div>;
}

export function SatAnalyserCard() { return <a className="sat-card" href="https://sat-analyzer.vercel.app" target="_blank" rel="noreferrer"><div className="sat-card-icon"><Target size={18} /></div><div><span className="card-kicker">Free companion tool</span><h3>SAT Analyser</h3><p>Find the topics costing you points and build a sharper practice plan.</p></div><ExternalLink size={15} /></a>; }

export function NotificationPanel({ onClose }: { onClose: () => void }) { return <div className="notification-popover"><div><strong>Notifications</strong><button onClick={onClose}><X size={14} /></button></div><p><Sparkles size={14} /> Your roadmap has a new priority for this week.</p><p><Award size={14} /> 3 scholarship deadlines are coming up.</p><p><Check size={14} /> University of Toronto is saved to your list.</p><button className="text-button" onClick={onClose}>Mark all as read</button></div>; }
