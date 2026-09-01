import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight, Sparkles, Compass, GraduationCap, FileText, Bot, Trophy,
  Star, Check, ChevronDown, Menu, X, Zap, Target, TrendingUp, Users,
  Award, BookOpen, Globe, Shield, Clock, Quote,
} from 'lucide-react';
import { universities } from '@/data/universities';
import type { University } from '@/data/universities';
import { getAvatarColor } from '@/lib/types';

type Props = {
  onSignUp: () => void;
  onLogin: () => void;
  showAuth: boolean;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  closeAuth: () => void;
  onAuthSuccess: (email: string, fullName?: string) => void;
};

// Scroll reveal hook
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Animated counter
function Counter({ target, suffix = '', duration = 1600 }: { target: number; suffix?: string; duration?: number }) {
  const { ref, visible } = useReveal<HTMLSpanElement>();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// University logos marquee
const topSchools = [
  'Harvard University', 'Stanford University', 'MIT', 'Princeton University',
  'Yale University', 'University of Oxford', 'University of Cambridge',
  'ETH Zurich', 'University of Toronto', 'NUS', 'UC Berkeley', 'Columbia University',
];

function SchoolMarquee() {
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {[...topSchools, ...topSchools].map((school, i) => {
          const initials = school.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
          const color = getAvatarColor(school);
          return (
            <div className="marquee-item" key={i}>
              <div className="marquee-logo" style={{ background: color }}>{initials}</div>
              <span>{school}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Testimonials
const testimonials = [
  { name: 'Jaya Mehta', role: 'Class of 2025 · CS at Toronto', text: 'StudentOS gave me something I didn\'t know I was missing: a way to see the next step. I stopped comparing myself to everyone else and started building my own story.', avatar: 'JM', color: '#cf8e72', rating: 5 },
  { name: 'Daniel Cho', role: 'Class of 2024 · Engineering at Georgia Tech', text: 'The AI advisor caught a gap in my application I would have missed. I got into my reach school with a scholarship I didn\'t know I qualified for.', avatar: 'DC', color: '#5b9be9', rating: 5 },
  { name: 'Aisha Rahman', role: 'Class of 2025 · Medicine at Oxford', text: 'I went from overwhelmed to organized in a weekend. The roadmap told me exactly what to do each month. No more guesswork.', avatar: 'AR', color: '#7ba98d', rating: 5 },
  { name: 'Marcus Webb', role: 'Class of 2023 · CS at Waterloo', text: 'The essay feedback alone was worth it. It caught cliches I didn\'t realize I was using and pushed me to be more specific. Game changer.', avatar: 'MW', color: '#e4a04d', rating: 5 },
  { name: 'Sofia Petrova', role: 'Class of 2024 · Math at Princeton', text: 'I tracked 12 applications in one place without losing my mind. The deadline reminders saved me from missing a critical submission.', avatar: 'SP', color: '#c2547a', rating: 5 },
  { name: 'Liam O\'Brien', role: 'Class of 2025 · Physics at ETH Zurich', text: 'The profile score kept me honest. Every time I improved a weakness, I could see it move. That feedback loop kept me going.', avatar: 'LO', color: '#1f6f8b', rating: 5 },
];

// Pricing tiers
const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to start building your profile.',
    features: ['Profile score & analysis', 'University finder (500+ schools)', 'Personalized roadmap', 'AI advisor (10 queries/month)', 'Application tracker', 'Essay center'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For serious applicants who want every advantage.',
    features: ['Everything in Free', 'Unlimited AI advisor', 'Advanced essay feedback', 'Scholarship matching (1,200+)', 'Deadline reminders', 'Priority support', 'Profile benchmarking'],
    cta: 'Start 14-day trial',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '$39',
    period: '/month',
    description: 'Full coaching suite for the final stretch.',
    features: ['Everything in Pro', '1-on-1 advisor reviews', 'Essay editing by experts', 'Interview prep', 'Strategy sessions', 'Parent dashboard access'],
    cta: 'Talk to us',
    highlight: false,
  },
];

// FAQ
const faqs = [
  { q: 'Is StudentOS free to use?', a: 'Yes. The free plan includes your profile score, university finder, roadmap, application tracker, and essay center — with 10 AI advisor queries per month. Upgrade to Pro for unlimited advisor access and advanced essay feedback.' },
  { q: 'Do I need to be in my senior year?', a: 'No. Starting early is the single biggest advantage. StudentOS works for students from Grade 9 through Grade 12. The earlier you start, the more time you have to build a profile that stands out.' },
  { q: 'Can it help with international universities?', a: 'Absolutely. We track 500+ universities across 20+ countries, including the US, UK, Canada, Germany, Netherlands, Singapore, Japan, and more. Filter by country, tuition, and scholarship availability.' },
  { q: 'How does the AI advisor work?', a: 'Your advisor analyzes your profile — GPA, SAT, activities, research, projects, and goals — and gives specific, actionable advice. Ask about universities, scholarships, competitions, essays, or your roadmap. It\'s like having a private consultant on call.' },
  { q: 'Is my data secure?', a: 'Your data is encrypted and never shared. We use bank-grade security. You can delete your account and all associated data at any time.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel with one click from your settings. No contracts, no hidden fees. If you cancel a paid plan, you keep access until the end of your billing period.' },
];

function Landing({ onSignUp, onLogin }: Props) {
  const [activeTab, setActiveTab] = useState<'plan' | 'finder' | 'advisor'>('plan');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* Nav */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-brand">
          <div className="brand-mark"><Sparkles size={17} strokeWidth={2.5} /></div>
          <span>student<span className="brand-os">OS</span></span>
        </div>
        <div className="landing-nav-links">
          <button onClick={() => scrollTo('how-it-works')}>How it works</button>
          <button onClick={() => scrollTo('features')}>Features</button>
          <button onClick={() => scrollTo('stories')}>Stories</button>
          <button onClick={() => scrollTo('pricing')}>Pricing</button>
          <button onClick={() => scrollTo('faq')}>FAQ</button>
        </div>
        <div className="landing-nav-actions">
          <button className="landing-login" onClick={onLogin}>Log in</button>
          <button className="landing-nav-cta" onClick={onSignUp}>Get your plan <ArrowUpRight size={14} /></button>
          <button className="mobile-nav-toggle" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {mobileNavOpen && (
        <div className="mobile-nav-menu">
          <button onClick={() => scrollTo('how-it-works')}>How it works</button>
          <button onClick={() => scrollTo('features')}>Features</button>
          <button onClick={() => scrollTo('stories')}>Stories</button>
          <button onClick={() => scrollTo('pricing')}>Pricing</button>
          <button onClick={() => scrollTo('faq')}>FAQ</button>
          <button className="mobile-nav-cta" onClick={onSignUp}>Get your plan <ArrowUpRight size={14} /></button>
        </div>
      )}

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-bg-grid" />
        <div className="hero-copy">
          <Reveal>
            <div className="landing-pill"><span className="pulse-dot" /> The admissions operating system for ambitious students</div>
          </Reveal>
          <Reveal delay={100}>
            <h1>Build a future<br /><em>you can get into.</em></h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="landing-lede">StudentOS turns your goals into a clear, personalized path to university — from the first SAT practice to the final application.</p>
          </Reveal>
          <Reveal delay={300}>
            <div className="landing-hero-actions">
              <button className="landing-primary" onClick={onSignUp}>Build my admissions plan <ArrowUpRight size={16} /></button>
              <button className="landing-play" onClick={() => scrollTo('how-it-works')}>
                <span className="play-icon">▶</span> See how it works
              </button>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="hero-proof">
              <div className="avatar-stack"><span>AR</span><span>JM</span><span>SK</span><span>+</span></div>
              <div><strong>Built for the next 100,000</strong><small>students building their edge</small></div>
            </div>
          </Reveal>
        </div>
        <Reveal delay={300} className="hero-product-shot-wrap">
          <div className="hero-product-shot">
            <div className="shot-glow" />
            <div className="shot-window">
              <div className="shot-bar">
                <div className="shot-dots"><i /><i /><i /></div>
                <span>studentOS / workspace</span>
                <span className="shot-live">LIVE</span>
              </div>
              <div className="shot-body">
                <div className="shot-sidebar">
                  <div className="shot-logo"><Sparkles size={9} /></div>
                  <i /><i /><i /><i /><i />
                </div>
                <div className="shot-main">
                  <div className="shot-greeting">
                    <small>YOUR NEXT BEST MOVE</small>
                    <strong>Strengthen your research profile.</strong>
                    <span>Your profile is 68% complete. One focused project could move you into the top 10%.</span>
                  </div>
                  <div className="shot-metrics">
                    <div><small>PROFILE SCORE</small><b>68<span>/100</span></b><i>+8 this month</i></div>
                    <div><small>UNIVERSITIES</small><b>520<span>+</span></b><i>matched to you</i></div>
                    <div><small>NEXT DEADLINE</small><b>51<span> days</span></b><i>Toronto · Early Action</i></div>
                  </div>
                  <div className="shot-bottom">
                    <div className="shot-chart">
                      <div className="shot-title">Your profile breakdown <span>See insights ↗</span></div>
                      <div className="chart-lines"><i style={{ width: '76%' }} /><i style={{ width: '68%' }} /><i style={{ width: '55%' }} /><i style={{ width: '42%' }} /></div>
                      <div className="chart-labels"><span>Academics</span><span>SAT</span><span>Research</span><span>Olympiads</span></div>
                    </div>
                    <div className="shot-ai">
                      <div><Bot size={12} /><small>AI ADVISOR</small></div>
                      <strong>"Focus on one<br />research project."</strong>
                      <span>See your plan ↗</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-score">
              <div className="floating-score-ring">94</div>
              <div><small>BEST MATCH</small><strong>University of Toronto</strong><span>Computer Science · 94% fit</span></div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Trust bar */}
      <section className="landing-trust">
        <span>One workspace for the whole journey</span>
        <div><strong><Counter target={500} suffix="+" /></strong>universities</div>
        <div><strong><Counter target={1200} suffix="+" /></strong>scholarships</div>
        <div><strong>24/7</strong>personal guidance</div>
      </section>

      {/* School marquee */}
      <SchoolMarquee />

      {/* How it works */}
      <section className="landing-section" id="how-it-works">
        <Reveal>
          <div className="section-intro">
            <div className="landing-eyebrow">THE DIFFERENCE IS DIRECTION</div>
            <h2>Stop guessing.<br /><em>Start building.</em></h2>
            <p>Most students collect advice. StudentOS turns it into momentum.</p>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <div className="landing-tabs">
            <div className="tab-buttons">
              {(['plan', 'finder', 'advisor'] as const).map((tab, i) => (
                <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                  <span>0{i + 1}</span>
                  {tab === 'plan' ? 'Know your edge' : tab === 'finder' ? 'Find your fit' : 'Make better moves'}
                </button>
              ))}
            </div>
            <div className="tab-content">
              {activeTab === 'plan' && (
                <>
                  <div className="tab-number">01</div>
                  <div>
                    <h3>Your profile, finally in one place.</h3>
                    <p>See exactly what makes you competitive — and what to improve next. Your academic profile, activities, projects, research, and goals become one clear picture.</p>
                    <button onClick={onSignUp}>Calculate my profile score <ArrowUpRight size={14} /></button>
                  </div>
                </>
              )}
              {activeTab === 'finder' && (
                <>
                  <div className="tab-number">02</div>
                  <div>
                    <h3>Find the schools that fit your story.</h3>
                    <p>Compare 500+ universities by major, tuition, acceptance rate, SAT range, scholarships, and your personalized likelihood of admission.</p>
                    <button onClick={onSignUp}>Explore your best matches <ArrowUpRight size={14} /></button>
                  </div>
                </>
              )}
              {activeTab === 'advisor' && (
                <>
                  <div className="tab-number">03</div>
                  <div>
                    <h3>Never wonder what to do next.</h3>
                    <p>Ask your AI advisor anything about universities, scholarships, research, competitions, or essays. Get a specific answer based on your profile.</p>
                    <button onClick={onSignUp}>Meet your advisor <ArrowUpRight size={14} /></button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Features */}
      <section className="landing-section feature-section" id="features">
        <Reveal>
          <div className="landing-eyebrow">ONE SYSTEM. EVERY ADVANTAGE.</div>
        </Reveal>
        <Reveal delay={80}>
          <div className="feature-heading">
            <h2>Everything your future<br />needs to <em>move forward.</em></h2>
            <p>Replace scattered tabs, generic advice, and late-night uncertainty with a system designed around how great applications are actually built.</p>
          </div>
        </Reveal>
        <div className="feature-grid">
          {[
            { icon: <Compass size={20} />, number: '01', title: 'Personalized roadmap', text: 'A month-by-month plan built around your grade, major, goals, and actual starting point.' },
            { icon: <GraduationCap size={20} />, number: '02', title: 'University finder', text: '500+ universities, ranked by fit — not just reputation. See your real best choices.' },
            { icon: <Sparkles size={20} />, number: '03', title: 'AI admissions advisor', text: 'A 24/7 mentor that knows your profile and gives advice you can act on today.' },
            { icon: <FileText size={20} />, number: '04', title: 'Application command center', text: 'Deadlines, essays, documents, and progress in one calm, focused workspace.' },
            { icon: <Trophy size={20} />, number: '05', title: 'Scholarship matching', text: '1,200+ scholarships matched to your profile, not a generic list you have to sift through.' },
            { icon: <BookOpen size={20} />, number: '06', title: 'Essay center with AI feedback', text: 'Write, edit, and get instant feedback that catches cliches and pushes you to be specific.' },
            { icon: <Target size={20} />, number: '07', title: 'Profile score tracking', text: 'See your score move as you improve. The feedback loop that keeps you motivated.' },
            { icon: <Globe size={20} />, number: '08', title: 'Global university coverage', text: '20+ countries, from the Ivy League to ETH Zurich to NUS. Your options, not someone else\'s.' },
          ].map((f, i) => (
            <Reveal key={f.number} delay={i * 60}>
              <article className="feature-card">
                <div className="feature-card-top">
                  <div className="feature-icon">{f.icon}</div>
                  <span>{f.number}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                <ArrowUpRight className="feature-arrow" size={16} />
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stats section */}
      <section className="landing-stats">
        <Reveal>
          <div className="stats-grid">
            <div className="stat-item">
              <TrendingUp size={28} />
              <strong><Counter target={94} suffix="%" /></strong>
              <span>of Pro users got into a top-3 choice</span>
            </div>
            <div className="stat-item">
              <Users size={28} />
              <strong><Counter target={100} suffix="K+" /></strong>
              <span>students building their profile</span>
            </div>
            <div className="stat-item">
              <Award size={28} />
              <strong><Counter target={48} suffix="M" /></strong>
              <span>in scholarships matched</span>
            </div>
            <div className="stat-item">
              <Clock size={28} />
              <strong><Counter target={3} suffix="x" /></strong>
              <span>faster application prep</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Testimonials */}
      <section className="landing-section" id="stories">
        <Reveal>
          <div className="section-intro">
            <div className="landing-eyebrow">REAL STUDENTS. REAL OUTCOMES.</div>
            <h2>Stories that <em>started here.</em></h2>
            <p>From overwhelmed to organized to accepted.</p>
          </div>
        </Reveal>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <article className="testimonial-card">
                <div className="testimonial-stars">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                </div>
                <p>"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: t.color }}>{t.avatar}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="landing-section" id="pricing">
        <Reveal>
          <div className="pricing-header">
            <div className="landing-eyebrow">SIMPLE, HONEST PRICING</div>
            <h2>Start free.<br /><em>Upgrade when it matters.</em></h2>
            <p>No hidden fees. No contracts. Cancel anytime.</p>
          </div>
        </Reveal>
        <div className="pricing-grid">
          {pricingTiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 100}>
              <div className={`pricing-card ${tier.highlight ? 'highlighted' : ''}`}>
                {tier.highlight && <div className="pricing-badge">Most popular</div>}
                <div className="pricing-tier-name">{tier.name}</div>
                <div className="pricing-price">
                  <strong>{tier.price}</strong>
                  <span>{tier.period}</span>
                </div>
                <p className="pricing-desc">{tier.description}</p>
                <ul className="pricing-features">
                  {tier.features.map((f) => (
                    <li key={f}><Check size={15} /> {f}</li>
                  ))}
                </ul>
                <button
                  className={`pricing-cta ${tier.highlight ? 'primary' : 'outline'}`}
                  onClick={onSignUp}
                >
                  {tier.cta} <ArrowUpRight size={14} />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="landing-section" id="faq">
        <Reveal>
          <div className="faq-header">
            <div className="landing-eyebrow">QUESTIONS, ANSWERED</div>
            <h2>Frequently asked<br /><em>questions.</em></h2>
          </div>
        </Reveal>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 50}>
              <div className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className="faq-chevron" />
                </button>
                {openFaq === i && <div className="faq-answer"><p>{faq.a}</p></div>}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="cta-glow" />
        <Reveal>
          <div className="landing-eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
          <h2>The students who stand out<br />are the ones who <em>start early.</em></h2>
          <p>Build a profile that feels like you — and a plan that gets you there.</p>
          <button className="landing-primary large" onClick={onSignUp}>Create my free plan <ArrowUpRight size={16} /></button>
          <small>No credit card. No generic advice. Just your next best move.</small>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="landing-brand">
              <div className="brand-mark"><Sparkles size={15} /></div>
              <span>student<span className="brand-os">OS</span></span>
            </div>
            <p>The admissions operating system for ambitious students. Built for students with somewhere to go.</p>
          </div>
          <div className="footer-col">
            <strong>Product</strong>
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('pricing')}>Pricing</button>
            <button onClick={() => scrollTo('how-it-works')}>How it works</button>
            <button onClick={() => scrollTo('stories')}>Stories</button>
          </div>
          <div className="footer-col">
            <strong>Company</strong>
            <button>About us</button>
            <button>Blog</button>
            <button>Careers</button>
            <button>Press kit</button>
          </div>
          <div className="footer-col">
            <strong>Support</strong>
            <button onClick={() => scrollTo('faq')}>FAQ</button>
            <button>Help center</button>
            <button>Contact us</button>
            <button>Privacy</button>
          </div>
          <div className="footer-col">
            <strong>Legal</strong>
            <button>Terms of service</button>
            <button>Privacy policy</button>
            <button>Cookie policy</button>
            <button>GDPR</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 StudentOS. All rights reserved.</span>
          <div className="footer-socials">
            <button><Globe size={16} /></button>
            <button><Shield size={16} /></button>
            <button><Zap size={16} /></button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
