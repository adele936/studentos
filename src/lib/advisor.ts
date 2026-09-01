import type { StudentProfile } from '@/lib/types';

export type AdvisorMessage = {
  role: 'user' | 'advisor';
  content: string;
  suggestions?: string[];
};

function scoreProfile(profile: StudentProfile) {
  const scores = {
    academics: profile.gpa >= 3.8 ? 85 : profile.gpa >= 3.5 ? 72 : profile.gpa >= 3.0 ? 58 : 40,
    sat: profile.satScore >= 1500 ? 92 : profile.satScore >= 1400 ? 80 : profile.satScore >= 1300 ? 68 : profile.satScore >= 1200 ? 55 : 40,
    olympiads: profile.olympiads.length * 15 + (profile.olympiads.some(o => o.includes('Medal') || o.includes('Winner')) ? 20 : 0),
    research: profile.research.length * 18 + (profile.research.length > 2 ? 15 : 0),
    leadership: profile.extracurriculars.filter(e => /president|leader|captain|founder|director/i.test(e)).length * 20 + 30,
    projects: profile.projects.length * 16 + (profile.projects.length > 2 ? 15 : 0),
    activities: Math.min(profile.extracurriculars.length * 12, 80),
  };
  const overall = Math.round(
    scores.academics * 0.25 + scores.sat * 0.20 + scores.olympiads * 0.12 +
    scores.research * 0.13 + scores.leadership * 0.10 + scores.projects * 0.10 + scores.activities * 0.10
  );
  return { scores, overall: Math.min(overall, 99) };
}

export function analyzeProfile(profile: StudentProfile) {
  const { scores, overall } = scoreProfile(profile);
  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  const weaknesses = sorted.slice(0, 2).map(([key]) => key);
  const strengths = sorted.slice(-2).map(([key]) => key);
  return { scores, overall, weaknesses, strengths };
}

export function generateAdvisorResponse(question: string, profile: StudentProfile): AdvisorMessage {
  const q = question.toLowerCase();
  const analysis = analyzeProfile(profile);

  if (q.includes('improve') && q.includes('profile')) {
    const tips: string[] = [];
    for (const weakness of analysis.weaknesses) {
      if (weakness === 'academics') tips.push(`Raise your GPA to at least 3.8 — focus on your core subjects this semester. Every 0.1 gain meaningfully shifts your profile.`);
      if (weakness === 'sat') tips.push(`Target a ${profile.satScore + 80}+ SAT score. Dedicate 30 minutes daily to practice tests and review missed questions twice.`);
      if (weakness === 'olympiads') tips.push(`Register for one Olympiad this semester (AMC, USACO, or IPhO depending on your major). Even participating signals intellectual curiosity.`);
      if (weakness === 'research') tips.push(`Start a small research project with a professor or independently. A published paper or conference poster is a top-tier differentiator.`);
      if (weakness === 'leadership') tips.push(`Take a leadership role in one of your existing activities. Depth + leadership beats breadth every time.`);
      if (weakness === 'projects') tips.push(`Build one substantial project this quarter — a coding project, research paper, or community initiative with measurable impact.`);
      if (weakness === 'activities') tips.push(`Add 1-2 meaningful extracurriculars aligned with your intended major. Consistency matters more than quantity.`);
    }
    return {
      role: 'advisor',
      content: `Your profile score is ${analysis.overall}/100. Here are the two highest-leverage improvements:\n\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n\n')}\n\nFocus on these first — they'll move your score the most.`,
      suggestions: ['Which universities match my profile?', 'Help me find a research project.', 'What competitions should I enter?'],
    };
  }

  if (q.includes('university') || q.includes('best fit') || q.includes('which school')) {
    const satMid = Math.round((profile.satScore + profile.satScore) / 2);
    const matches = [
      { name: getReachSchool(profile.intendedMajor, profile.country), reason: 'Reach school — your academics align but acceptance is competitive. Apply early to show interest.' },
      { name: getMatchSchool(profile.intendedMajor), reason: 'Strong match — your SAT and GPA put you in a competitive position. This is a realistic target.' },
      { name: getSafetySchool(profile.intendedMajor), reason: 'Safety school — your profile exceeds their average admitted student. You should be confident here.' },
    ];
    return {
      role: 'advisor',
      content: `Based on your SAT of ${profile.satScore}, GPA of ${profile.gpa}, and interest in ${profile.intendedMajor}, here are my recommendations:\n\n${matches.map((m) => `**${m.name}**\n${m.reason}`).join('\n\n')}\n\nI've factored in your ${profile.country === 'United States' ? 'domestic' : 'international'} status and your ${profile.olympiads.length > 0 ? 'Olympiad experience' : 'current activity level'}.`,
      suggestions: ['Tell me about scholarships I qualify for.', 'How can I improve my profile score?', 'Create a roadmap for these schools.'],
    };
  }

  if (q.includes('research') || q.includes('project')) {
    const ideas = getResearchIdeas(profile.intendedMajor);
    return {
      role: 'advisor',
      content: `Here are three research project ideas tailored to ${profile.intendedMajor}:\n\n${ideas.map((idea, i) => `${i + 1}. **${idea.title}**\n${idea.description}\n*Difficulty: ${idea.difficulty} | Timeline: ${idea.timeline}*`).join('\n\n')}\n\nStart with the one that excites you most. I can add it to your roadmap immediately.`,
      suggestions: ['Add this to my roadmap.', 'Find a mentor for this.', 'What competitions relate to this?'],
    };
  }

  if (q.includes('scholarship') || q.includes('funding') || q.includes('money')) {
    return {
      role: 'advisor',
      content: `Based on your profile, here are scholarships worth pursuing:\n\n1. **Global STEM Scholars Award** — $25,000, deadline Dec 10. You qualify with your SAT score and CS interest.\n2. **Merit Excellence Grant** — $15,000, deadline Jan 15. Open to students with GPA 3.5+.\n3. **Future Leaders Scholarship** — $10,000, deadline Feb 1. Requires a leadership essay — your extracurriculars make you competitive.\n\nApply to all three. The first is your strongest match.`,
      suggestions: ['Help me write the leadership essay.', 'Find more scholarships.', 'How do I improve my chances?'],
    };
  }

  if (q.includes('competition') || q.includes('olympiad') || q.includes('contest')) {
    return {
      role: 'advisor',
      content: `Competitions that match your profile in ${profile.intendedMajor}:\n\n1. **AMC 12 / AIME** — Mathematics. Deadline January. Great for demonstrating quantitative strength.\n2. **USACO (Silver/Gold)** — Computer Science. Monthly contests. Your coding projects give you a head start.\n3. **Science Olympiad** — Multiple subjects. Regional rounds in October.\n\nStart with one. Even a strong participation record matters to admissions.`,
      suggestions: ['Add AMC to my roadmap.', 'How do I prepare for USACO?', 'Find me a research project.'],
    };
  }

  if (q.includes('roadmap') || q.includes('plan')) {
    return {
      role: 'advisor',
      content: `I've analyzed your profile and generated a personalized roadmap. Here's the summary:\n\n**This month:** Focus on ${analysis.weaknesses[0] === 'sat' ? 'raising your SAT score with daily practice' : analysis.weaknesses[0] === 'research' ? 'launching a research project' : 'strengthening your ' + analysis.weaknesses[0]}.\n**Next month:** Begin ${profile.olympiads.length === 0 ? 'Olympiad preparation' : 'deepening your existing activities'}.\n**In 3 months:** Draft your personal statement and request recommendation letters.\n\nYour target: a profile score of ${Math.min(analysis.overall + 12, 95)} within 6 months. This is achievable.`,
      suggestions: ['Open my roadmap.', 'What should I do this week?', 'Review my profile score.'],
    };
  }

  if (q.includes('essay') || q.includes('write') || q.includes('personal statement')) {
    return {
      role: 'advisor',
      content: `Your personal statement should anchor on one specific moment — not a list of achievements. Here's a framework:\n\n1. **Hook:** Start with a concrete moment (a problem you noticed, a question you couldn't stop asking).\n2. **Tension:** What made it hard? What did you learn about yourself?\n3. **Resolution:** How did you act on it? What changed?\n4. **Forward:** How does this connect to what you want to do at university?\n\nAvoid the word "passion" — show it instead. Your strongest material is in your ${profile.projects.length > 0 ? 'projects' : profile.extracurriculars.length > 0 ? 'extracurriculars' : 'academic journey'}.`,
      suggestions: ['Review my draft.', 'Give me essay prompts.', 'Help me find my story.'],
    };
  }

  // Default response
  return {
    role: 'advisor',
    content: `I'm your personal admissions consultant. I've reviewed your profile:\n\n- **Profile score:** ${analysis.overall}/100\n- **Strongest areas:** ${analysis.strengths.join(', ')}\n- **Biggest opportunities:** ${analysis.weaknesses.join(', ')}\n\nAsk me about universities, scholarships, research projects, competitions, your roadmap, or your essays. I'll give you specific, actionable advice — not generic tips.`,
    suggestions: ['How can I improve my profile score?', 'Which universities are my best fit?', 'Help me find a research project.'],
  };
}

function getReachSchool(major: string, country: string): string {
  const reach: Record<string, string> = {
    'Computer Science': 'Carnegie Mellon University',
    'Engineering': 'MIT',
    'Business': 'University of Pennsylvania',
    'Medicine': 'Johns Hopkins University',
    'Mathematics': 'Princeton University',
    'Physics': 'Caltech',
  };
  return reach[major] || 'Stanford University';
}

function getMatchSchool(major: string): string {
  const match: Record<string, string> = {
    'Computer Science': 'University of Waterloo',
    'Engineering': 'Georgia Tech',
    'Business': 'University of Michigan',
    'Medicine': 'University of Toronto',
    'Mathematics': 'University of Chicago',
    'Physics': 'ETH Zurich',
  };
  return match[major] || 'University of Toronto';
}

function getSafetySchool(major: string): string {
  const safety: Record<string, string> = {
    'Computer Science': 'University of British Columbia',
    'Engineering': 'Purdue University',
    'Business': 'University of Illinois',
    'Medicine': 'McMaster University',
    'Mathematics': 'Ohio State University',
    'Physics': 'University of Amsterdam',
  };
  return safety[major] || 'University of Melbourne';
}

function getResearchIdeas(major: string): { title: string; description: string; difficulty: string; timeline: string }[] {
  const ideas: Record<string, { title: string; description: string; difficulty: string; timeline: string }[]> = {
    'Computer Science': [
      { title: 'AI Tutor for K-12 Math', description: 'Build a lightweight AI tutor that adapts to student mistakes using a fine-tuned model. Deploy it in a local school.', difficulty: 'Medium', timeline: '8 weeks' },
      { title: 'Algorithmic Fairness Audit', description: 'Audit a public ML dataset for bias and publish a technical report with recommendations.', difficulty: 'Hard', timeline: '10 weeks' },
      { title: 'Open-source Developer Tool', description: 'Create a CLI tool that solves a real problem for developers and grow it to 100+ GitHub stars.', difficulty: 'Medium', timeline: '6 weeks' },
    ],
    'Engineering': [
      { title: 'Low-cost Water Quality Sensor', description: 'Design and prototype an IoT sensor for under $20 that measures water contamination.', difficulty: 'Hard', timeline: '12 weeks' },
      { title: 'Solar-powered Phone Charger', description: 'Build and deploy solar chargers in a community off the grid. Document the impact.', difficulty: 'Medium', timeline: '6 weeks' },
      { title: 'Drone for Agricultural Mapping', description: 'Program a drone to map crop health using computer vision. Partner with a local farm.', difficulty: 'Hard', timeline: '10 weeks' },
    ],
    'Mathematics': [
      { title: 'Original Proof in Combinatorics', description: 'Work with a professor on an open problem in Ramsey theory. Submit to a student journal.', difficulty: 'Hard', timeline: '16 weeks' },
      { title: 'Mathematical Modeling of Traffic Flow', description: 'Model and simulate traffic in your city. Publish findings in a school journal.', difficulty: 'Medium', timeline: '8 weeks' },
      { title: 'Statistical Analysis of Local Data', description: 'Partner with a local NGO to analyze their data and produce actionable insights.', difficulty: 'Medium', timeline: '6 weeks' },
    ],
  };
  return ideas[major] || ideas['Computer Science'];
}

export function generateRoadmap(profile: StudentProfile) {
  const analysis = analyzeProfile(profile);
  const milestones: { month: string; title: string; detail: string; type: string; color: string }[] = [];
  const months = ['This Month', 'Next Month', 'In 3 Months', 'In 4 Months', 'In 5 Months', 'In 6 Months'];
  const focusArea = analysis.weaknesses[0];

  const plans: Record<string, { title: string; detail: string; type: string; color: string }[]> = {
    sat: [
      { title: 'Take a full SAT diagnostic', detail: 'Identify your weakest sections. Set a target score of ' + (profile.satScore + 80) + '+.', type: 'Foundation', color: 'blue' },
      { title: 'Daily SAT practice (30 min)', detail: 'Focus on Math and Writing. Review every missed question twice.', type: 'Daily habit', color: 'blue' },
      { title: 'Take 2 more practice tests', detail: 'Simulate real conditions. Track your score trend week over week.', type: 'Momentum', color: 'orange' },
      { title: 'Register for the SAT', detail: 'Book your test date. Send scores to 4 target universities for free.', type: 'Logistics', color: 'green' },
      { title: 'Final SAT prep sprint', detail: 'Focus exclusively on your weakest section. Aim for +50 points.', type: 'Sprint', color: 'red' },
      { title: 'Take the official SAT', detail: "You're ready. Trust your preparation and execute.", type: 'Milestone', color: 'green' },
    ],
    research: [
      { title: 'Choose a research topic', detail: 'Pick a question in ' + profile.intendedMajor + ' that genuinely interests you.', type: 'Foundation', color: 'blue' },
      { title: 'Find a mentor', detail: 'Email 5 professors or professionals. Aim for one yes.', type: 'Outreach', color: 'blue' },
      { title: 'Literature review', detail: 'Read 10 papers. Write a 2-page summary of the current state of your topic.', type: 'Deep work', color: 'orange' },
      { title: 'Begin your project', detail: 'Start collecting data or building your prototype. Document everything.', type: 'Execution', color: 'orange' },
      { title: 'Write your first draft', detail: 'Turn your findings into a paper or technical report. Share with your mentor.', type: 'Writing', color: 'red' },
      { title: 'Submit to a competition or journal', detail: 'Enter a science fair, submit to a student journal, or present at a conference.', type: 'Milestone', color: 'green' },
    ],
    olympiads: [
      { title: 'Choose your Olympiad', detail: 'Based on your major (' + profile.intendedMajor + '), start with AMC, USACO, or IPhO.', type: 'Foundation', color: 'blue' },
      { title: 'Study past problems', detail: 'Complete 20 past problems. Focus on understanding patterns, not just answers.', type: 'Practice', color: 'blue' },
      { title: 'Join a study group', detail: 'Find or form a group of 3-4 students. Meet weekly to solve problems together.', type: 'Community', color: 'orange' },
      { title: 'Take a mock exam', detail: 'Simulate competition conditions. Identify your weak topics.', type: 'Benchmark', color: 'orange' },
      { title: 'Register for the competition', detail: 'Book your spot. Check deadlines for your region.', type: 'Logistics', color: 'green' },
      { title: 'Compete', detail: "You're prepared. Give it your best — even participating is a signal.", type: 'Milestone', color: 'green' },
    ],
    leadership: [
      { title: 'Audit your activities', detail: 'List all your extracurriculars. Identify where you can take on more responsibility.', type: 'Foundation', color: 'blue' },
      { title: 'Pitch a leadership role', detail: 'Ask to lead a project or initiative in your strongest activity.', type: 'Action', color: 'blue' },
      { title: 'Launch an initiative', detail: 'Start something new within an existing club — a workshop, a campaign, a mentorship program.', type: 'Execution', color: 'orange' },
      { title: 'Measure your impact', detail: 'Track numbers: people reached, hours saved, money raised. Admissions love data.', type: 'Evidence', color: 'orange' },
      { title: 'Write your leadership story', detail: 'Document what you did, what was hard, and what you learned. This is essay material.', type: 'Writing', color: 'red' },
      { title: 'Get a recommendation', detail: 'Ask your activity advisor for a letter highlighting your leadership.', type: 'Milestone', color: 'green' },
    ],
    projects: [
      { title: 'Choose a project', detail: 'Pick something in ' + profile.intendedMajor + ' that you can finish in 8 weeks.', type: 'Foundation', color: 'blue' },
      { title: 'Build a prototype', detail: "Create a minimum viable version. It doesn't need to be perfect — it needs to work.", type: 'Execution', color: 'blue' },
      { title: 'Get feedback', detail: 'Show it to 5 people. Listen to what confuses them and what excites them.', type: 'Iteration', color: 'orange' },
      { title: 'Iterate and polish', detail: 'Fix the top 3 issues. Add one feature that delights users.', type: 'Refinement', color: 'orange' },
      { title: 'Publish your project', detail: 'Put it on GitHub, write a blog post, or submit to a competition.', type: 'Launch', color: 'red' },
      { title: 'Document your process', detail: 'Write a case study. This becomes a portfolio piece and essay material.', type: 'Milestone', color: 'green' },
    ],
    academics: [
      { title: 'Identify weak subjects', detail: 'Look at your last report card. Pick the one subject dragging your GPA down.', type: 'Foundation', color: 'blue' },
      { title: 'Create a study schedule', detail: 'Dedicate 45 minutes daily to your weakest subject. Use active recall.', type: 'Habit', color: 'blue' },
      { title: 'Get extra help', detail: 'Meet with your teacher weekly. Ask questions before you fall behind.', type: 'Support', color: 'orange' },
      { title: 'Take a challenging course', detail: 'Add an AP, IB, or honors class next semester. Rigor matters.', type: 'Rigor', color: 'orange' },
      { title: 'Ace your midterms', detail: 'Your study system should now be automatic. Trust it and execute.', type: 'Benchmark', color: 'red' },
      { title: 'Review and plan', detail: 'Assess your GPA trajectory. Adjust your strategy for the final push.', type: 'Milestone', color: 'green' },
    ],
    activities: [
      { title: 'Map your interests', detail: 'List 5 things you genuinely care about. Pick 2 to turn into activities.', type: 'Foundation', color: 'blue' },
      { title: 'Join one new activity', detail: 'Find a club, competition, or volunteer opportunity aligned with your major.', type: 'Action', color: 'blue' },
      { title: 'Commit to consistency', detail: 'Show up every week for 2 months. Depth beats breadth.', type: 'Habit', color: 'orange' },
      { title: 'Take initiative', detail: 'Propose a new project or event within your activity. Lead it.', type: 'Leadership', color: 'orange' },
      { title: 'Document your impact', detail: 'Track what you did, hours, and outcomes. This is for your application.', type: 'Evidence', color: 'red' },
      { title: 'Reflect and refine', detail: 'Decide what to continue, drop, or deepen next year.', type: 'Milestone', color: 'green' },
    ],
  };

  const plan = plans[focusArea] || plans.sat;
  for (let i = 0; i < months.length; i++) {
    milestones.push({ month: months[i], ...plan[i] });
  }
  return milestones;
}
