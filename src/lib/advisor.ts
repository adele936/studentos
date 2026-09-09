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

// Topic detection — figures out what the user is asking about
function detectTopic(question: string): string[] {
  const q = question.toLowerCase();
  const topics: string[] = [];

  if (/\b(improve|raise|boost|better|increase|strengthen|fix|gap|weak|weakness)\b/.test(q) && /\b(profile|score|chance|gpa|sat|application)\b/.test(q)) topics.push('improve_profile');
  if (/\b(university|universities|college|colleges|school|schools|fit|match|reach|safety|target|ivy|ivies)\b/.test(q)) topics.push('universities');
  if (/\b(research|paper|lab|professor|mentor|study|investigate|experiment|hypothesis)\b/.test(q)) topics.push('research');
  if (/\b(scholarship|scholarships|funding|money|financial aid|grant|grants|pay|cost|afford|tuition|fee|fees)\b/.test(q)) topics.push('scholarships');
  if (/\b(competition|competitions|olympiad|olympiads|contest|contests|amc|usaco|science olympiad|debate|quiz|robotics)\b/.test(q)) topics.push('competitions');
  if (/\b(roadmap|plan|timeline|schedule|when|what should i do|next step|strategy|milestone)\b/.test(q)) topics.push('roadmap');
  if (/\b(essay|essays|personal statement|writing|write|draft|common app essay|supplement|word count|hook)\b/.test(q)) topics.push('essays');
  if (/\b(sat|act|test|score|practice|diagnostic|math|reading|writing section|1600)\b/.test(q)) topics.push('sat');
  if (/\b(recommendation|recommendations|letter|letters|teacher|counselor|reference)\b/.test(q)) topics.push('recommendations');
  if (/\b(interview|interviews|alumni|admissions officer|questions to ask)\b/.test(q)) topics.push('interview');
  if (/\b(extracurricular|extracurriculars|activity|activities|club|clubs|volunteer|leadership|community service|sports)\b/.test(q)) topics.push('activities');
  if (/\b(gpa|grade|grades|transcript|class rank|course rigor|ap|ib|honors)\b/.test(q)) topics.push('academics');
  if (/\b(deadline|deadlines|early action|early decision|regular decision|when is|due date|application deadline)\b/.test(q)) topics.push('deadlines');
  if (/\b(major|majors|what to study|field|career|job|profession|computer science|engineering|medicine|business)\b/.test(q)) topics.push('major');
  if (/\b(international|abroad|visa|student visa|outside us|my country|home country)\b/.test(q)) topics.push('international');
  if (/\b(gap year|defer|deferred|take a year|year off)\b/.test(q)) topics.push('gap_year');
  if (/\b(transfer|community college|switch|changing schools)\b/.test(q)) topics.push('transfer');
  if (/\b(mental health|stress|anxiety|burnout|overwhelmed|pressure|balance|wellness)\b/.test(q)) topics.push('wellness');
  if (/\b(hello|hi|hey|help|what can you do|who are you|start)\b/.test(q)) topics.push('greeting');

  return topics;
}

export function generateAdvisorResponse(question: string, profile: StudentProfile): AdvisorMessage {
  const analysis = analyzeProfile(profile);
  const topics = detectTopic(question);

  // No topic detected — give a thoughtful general response
  if (topics.length === 0) {
    return generateGeneralResponse(question, profile, analysis);
  }

  const responses: AdvisorMessage[] = [];

  for (const topic of topics) {
    switch (topic) {
      case 'improve_profile':
        responses.push(generateImprovementResponse(profile, analysis));
        break;
      case 'universities':
        responses.push(generateUniversityResponse(profile, analysis));
        break;
      case 'research':
        responses.push(generateResearchResponse(profile));
        break;
      case 'scholarships':
        responses.push(generateScholarshipResponse(profile, analysis));
        break;
      case 'competitions':
        responses.push(generateCompetitionResponse(profile));
        break;
      case 'roadmap':
        responses.push(generateRoadmapResponse(profile, analysis));
        break;
      case 'essays':
        responses.push(generateEssayResponse(profile));
        break;
      case 'sat':
        responses.push(generateSatResponse(profile));
        break;
      case 'recommendations':
        responses.push(generateRecommendationResponse(profile));
        break;
      case 'interview':
        responses.push(generateInterviewResponse(profile));
        break;
      case 'activities':
        responses.push(generateActivitiesResponse(profile, analysis));
        break;
      case 'academics':
        responses.push(generateAcademicsResponse(profile, analysis));
        break;
      case 'deadlines':
        responses.push(generateDeadlineResponse(profile));
        break;
      case 'major':
        responses.push(generateMajorResponse(profile));
        break;
      case 'international':
        responses.push(generateInternationalResponse(profile));
        break;
      case 'gap_year':
        responses.push(generateGapYearResponse(profile));
        break;
      case 'transfer':
        responses.push(generateTransferResponse(profile));
        break;
      case 'wellness':
        responses.push(generateWellnessResponse(profile));
        break;
      case 'greeting':
        responses.push(generateGreetingResponse(profile, analysis));
        break;
    }
  }

  // Combine multiple topic responses
  if (responses.length === 1) return responses[0];

  return {
    role: 'advisor',
    content: responses.map(r => r.content).join('\n\n---\n\n'),
    suggestions: responses.flatMap(r => r.suggestions || []).slice(0, 4),
  };
}

function generateGeneralResponse(question: string, profile: StudentProfile, analysis: ReturnType<typeof analyzeProfile>): AdvisorMessage {
  // Try to extract what the user might be asking about from the question text
  const q = question.toLowerCase();

  // If it looks like a question about their chances
  if (q.includes('chance') || q.includes('likely') || q.includes('can i get') || q.includes('will i')) {
    return {
      role: 'advisor',
      content: `Based on your profile (SAT ${profile.satScore}, GPA ${profile.gpa}, ${profile.extracurriculars.length} activities, ${profile.research.length} research projects), your estimated profile score is ${analysis.overall}/100.\n\nThis puts you in a competitive position for mid-tier universities and a stretch for top-20 schools. Your biggest opportunity is in ${analysis.weaknesses[0]}.\n\nFor a more specific answer, tell me which university you're targeting and I'll break down your chances.`,
      suggestions: ['Which universities are my best fit?', 'How can I improve my profile score?', 'What\'s my chance at a top-20 school?'],
    };
  }

  // If it seems like they're asking about what to do
  if (q.includes('what should') || q.includes('what do') || q.includes('how do i') || q.includes('where do i start')) {
    return {
      role: 'advisor',
      content: `Great question. Let me think about your situation.\n\nYou're in ${profile.grade} studying ${profile.intendedMajor} with a ${profile.gpa} GPA and ${profile.satScore} SAT. Your profile score is ${analysis.overall}/100.\n\nHere\'s what I\'d prioritize:\n1. **${analysis.weaknesses[0]}** — this is your biggest gap. Improving it will move your score the most.\n2. **${analysis.weaknesses[1]}** — your second opportunity area.\n3. Start your **personal statement** early — it takes longer than you think.\n\nWhat specifically are you wondering about? I can help with universities, scholarships, research, competitions, essays, your roadmap, SAT prep, recommendations, interviews, and more.`,
      suggestions: ['Which universities match my profile?', 'Help me find a research project', 'When should I start my essays?'],
    };
  }

  // Default thoughtful response
  return {
    role: 'advisor',
    content: `I'm thinking about your question. Here's what I can tell you based on your profile:\n\nYour profile score is ${analysis.overall}/100. Your strengths are in ${analysis.strengths.join(' and ')}, and your biggest opportunities are in ${analysis.weaknesses.join(' and ')}.\n\nI can help you with:\n- **Universities** — finding your best-fit schools and assessing your chances\n- **Scholarships** — matching you to funding opportunities\n- **Research** — suggesting project ideas and how to get started\n- **Competitions** — recommending Olympiads and contests for your major\n- **Essays** — structuring your personal statement and getting feedback\n- **SAT prep** — building a study plan to raise your score\n- **Roadmap** — creating a month-by-month plan\n- **Recommendations** — choosing the right teachers and timing your asks\n- **Interviews** — preparing for alumni and admissions interviews\n- **Activities** — deepening your extracurriculars strategically\n\nWhat would you like to dive into?`,
    suggestions: ['How can I improve my profile score?', 'Which universities are my best fit?', 'Help me find a research project'],
  };
}

function generateImprovementResponse(profile: StudentProfile, analysis: ReturnType<typeof analyzeProfile>): AdvisorMessage {
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

function generateUniversityResponse(profile: StudentProfile, analysis: ReturnType<typeof analyzeProfile>): AdvisorMessage {
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

function generateResearchResponse(profile: StudentProfile): AdvisorMessage {
  const ideas = getResearchIdeas(profile.intendedMajor);
  return {
    role: 'advisor',
    content: `Here are three research project ideas tailored to ${profile.intendedMajor}:\n\n${ideas.map((idea, i) => `${i + 1}. **${idea.title}**\n${idea.description}\n*Difficulty: ${idea.difficulty} | Timeline: ${idea.timeline}*`).join('\n\n')}\n\nStart with the one that excites you most. I can add it to your roadmap immediately.`,
    suggestions: ['Add this to my roadmap.', 'Find a mentor for this.', 'What competitions relate to this?'],
  };
}

function generateScholarshipResponse(profile: StudentProfile, analysis: ReturnType<typeof analyzeProfile>): AdvisorMessage {
  return {
    role: 'advisor',
    content: `Based on your profile, here are scholarships worth pursuing:\n\n1. **Coca-Cola Scholars Program** — $20,000, deadline Oct 31. Awards 150 scholarships to students with leadership and community impact. Your ${profile.extracurriculars.length} activities make you competitive.\n2. **QuestBridge National College Match** — Full ride, deadline Sep 28. If your family income is under $65K, this could fund your entire education at a top-50 school.\n3. **Regeneron Science Talent Search** — $250,000, deadline Nov 9. Your ${profile.research.length} research project(s) qualify you. This is the most prestigious science competition in the US.\n4. **Jack Kent Cooke Scholarship** — $40,000/yr, deadline Nov 14. For high-achieving students with financial need. Your ${analysis.overall}/100 profile score makes you a strong candidate.\n\nI'd prioritize QuestBridge (if eligible) and Regeneron. Want me to help you prepare for any of these?`,
    suggestions: ['Help me write the Coca-Cola essay.', 'Am I eligible for QuestBridge?', 'Find more scholarships.'],
  };
}

function generateCompetitionResponse(profile: StudentProfile): AdvisorMessage {
  return {
    role: 'advisor',
    content: `Competitions that match your profile in ${profile.intendedMajor}:\n\n1. **AMC 12 / AIME** — Mathematics. Deadline January. Great for demonstrating quantitative strength.\n2. **USACO (Silver/Gold)** — Computer Science. Monthly contests. Your coding projects give you a head start.\n3. **Science Olympiad** — Multiple subjects. Regional rounds in October.\n4. **Regeneron STS** — Original research. Top prize $250,000. Deadline November.\n\nStart with one. Even a strong participation record matters to admissions.`,
    suggestions: ['Add AMC to my roadmap.', 'How do I prepare for USACO?', 'Find me a research project.'],
  };
}

function generateRoadmapResponse(profile: StudentProfile, analysis: ReturnType<typeof analyzeProfile>): AdvisorMessage {
  return {
    role: 'advisor',
    content: `I've analyzed your profile and generated a personalized roadmap. Here's the summary:\n\n**This month:** Focus on ${analysis.weaknesses[0] === 'sat' ? 'raising your SAT score with daily practice' : analysis.weaknesses[0] === 'research' ? 'launching a research project' : 'strengthening your ' + analysis.weaknesses[0]}.\n**Next month:** Begin ${profile.olympiads.length === 0 ? 'Olympiad preparation' : 'deepening your existing activities'}.\n**In 3 months:** Draft your personal statement and request recommendation letters.\n**In 6 months:** Submit applications for early action/decision rounds.\n\nYour target: a profile score of ${Math.min(analysis.overall + 12, 95)} within 6 months. This is achievable.`,
    suggestions: ['Open my roadmap.', 'What should I do this week?', 'Review my profile score.'],
  };
}

function generateEssayResponse(profile: StudentProfile): AdvisorMessage {
  return {
    role: 'advisor',
    content: `Your personal statement should anchor on one specific moment — not a list of achievements. Here's a framework:\n\n1. **Hook:** Start with a concrete moment (a problem you noticed, a question you couldn't stop asking).\n2. **Tension:** What made it hard? What did you learn about yourself?\n3. **Resolution:** How did you act on it? What changed?\n4. **Forward:** How does this connect to what you want to do at university?\n\nAvoid the word "passion" — show it instead. Your strongest material is in your ${profile.projects.length > 0 ? 'projects' : profile.extracurriculars.length > 0 ? 'extracurriculars' : 'academic journey'}.\n\nFor Common App, the main essay is 650 words. Supplements vary — start those after your main essay is solid.`,
    suggestions: ['Review my draft.', 'Give me Common App prompts.', 'Help me find my story.'],
  };
}

function generateSatResponse(profile: StudentProfile): AdvisorMessage {
  const target = profile.satScore + 80;
  return {
    role: 'advisor',
    content: `Your current SAT is ${profile.satScore}. Here's a plan to reach ${target}+:\n\n**Week 1-2:** Take a full diagnostic test. Identify your weakest section (Math, Reading, or Writing).\n**Week 3-6:** Focus 30 min/day on your weakest section. Use Khan Academy SAT prep (free) or College Board practice tests.\n**Week 7-8:** Take 2 full practice tests under timed conditions. Review every missed question.\n**Week 9-10:** Final sprint on your weakest topics. Aim for +50-80 points.\n\nKey tip: The SAT rewards consistency more than intensity. 30 minutes daily beats 4 hours on Sunday.\n\nAlso check out the SAT Analyser tool in your workspace — it can give you a personalized breakdown of where to focus.`,
    suggestions: ['Add SAT prep to my roadmap.', 'Which universities match my target score?', 'Help me find practice resources.'],
  };
}

function generateRecommendationResponse(profile: StudentProfile): AdvisorMessage {
  return {
    role: 'advisor',
    content: `Recommendation letters can make or break a borderline application. Here's how to approach them:\n\n**Who to ask:**\n- 1 teacher from a core academic subject (Math, Science, English, History)\n- 1 teacher who knows you well and can speak to your growth, not just your grade\n- For STEM majors: a math or science teacher. For humanities: an English or history teacher.\n\n**When to ask:**\n- End of junior year (May/June) for early action/decision\n- At least 6-8 weeks before your deadline\n\n**How to ask:**\n- Ask in person, then follow up with a "brag sheet" — your resume, your target schools, and 2-3 specific things you'd like them to mention (a project, a moment of growth, a challenge you overcame).\n\nYou have ${profile.projects.length} project(s) and ${profile.research.length} research experience — give your teacher specific examples to reference.`,
    suggestions: ['Help me write a brag sheet.', 'When should I ask my counselor?', 'What if my teacher says no?'],
  };
}

function generateInterviewResponse(profile: StudentProfile): AdvisorMessage {
  return {
    role: 'advisor',
    content: `Admissions interviews (especially alumni interviews) are your chance to show who you are beyond the paper application.\n\n**Before the interview:**\n- Research the school's specific programs, traditions, and values\n- Prepare 3-5 stories that show your growth, curiosity, and impact\n- Have 3-5 thoughtful questions ready (not things you could Google)\n\n**During the interview:**\n- Be specific, not generic — "I love the collaborative culture at [School]" is weak. "When I visited, I sat in on Professor X's class and was struck by..." is strong.\n- Ask about their experience — alumni love sharing their story.\n- Be authentic. Don't perform — connect.\n\n**After:**\n- Send a thank-you email within 24 hours referencing something specific from your conversation.\n\nYour ${profile.extracurriculars.length} activities and ${profile.projects.length} projects give you plenty to talk about. Pick the stories that show growth, not just achievement.`,
    suggestions: ['Practice interview questions with me.', 'What should I wear?', 'How do I handle a tough question?'],
  };
}

function generateActivitiesResponse(profile: StudentProfile, analysis: ReturnType<typeof analyzeProfile>): AdvisorMessage {
  return {
    role: 'advisor',
    content: `You have ${profile.extracurriculars.length} activities listed. Here's my assessment:\n\n${profile.extracurriculars.length < 5 ? `You're on the lighter side. Admissions officers prefer depth over breadth — but you need enough to show engagement. Consider adding 1-2 activities aligned with ${profile.intendedMajor}.` : profile.extracurriculars.length > 10 ? `You have a lot of activities. The Common App only has room for 10 — pick the ones where you had the most impact and showed the most growth. Cut the rest.` : `You have a solid number of activities. Now focus on deepening your top 2-3 — take on leadership roles, create something new within them, or connect them to your academic interests.`}\n\nYour strongest area is ${analysis.strengths[0]}. Lean into that.\n\nRemember: admissions officers read thousands of activity lists. Specificity wins. Instead of "Coding Club Member," write "Built a web app for a local nonprofit, 50+ hours, led a team of 3."`,
    suggestions: ['How do I show leadership?', 'Which activities should I drop?', 'Help me describe my activities.'],
  };
}

function generateAcademicsResponse(profile: StudentProfile, analysis: ReturnType<typeof analyzeProfile>): AdvisorMessage {
  return {
    role: 'advisor',
    content: `Your GPA is ${profile.gpa} out of 4.0. Here's how that positions you:\n\n${profile.gpa >= 3.8 ? `Your GPA is strong — you're in the competitive range for most universities, including Ivy League schools. Focus on maintaining it and taking the most rigorous courses available (AP, IB, or dual enrollment).` : profile.gpa >= 3.5 ? `Your GPA is solid but not top-tier. For top-20 schools, aim to raise it to 3.8+. For match schools, you're in good shape. Consider taking AP or honors classes to show course rigor.` : `Your GPA is below the typical threshold for competitive universities. Focus on an upward trend — if your junior year grades are significantly better, that helps. Also strengthen your SAT/ACT and activities to compensate.`}\n\nCourse rigor matters as much as the number. A 3.7 with 8 AP classes can beat a 4.0 with no APs.\n\nYour academic score is ${analysis.scores.academics}/100. ${analysis.weaknesses.includes('academics') ? 'This is one of your priority areas to improve.' : 'This is one of your strengths.'}`,
    suggestions: ['Should I take AP classes?', 'How do I raise my GPA?', 'Which universities match my GPA?'],
  };
}

function generateDeadlineResponse(profile: StudentProfile): AdvisorMessage {
  return {
    role: 'advisor',
    content: `Here are the key application deadlines to plan around:\n\n**Early Decision / Early Action:** November 1, 2026\n- Binding (ED) or non-binding (EA). Gives you a higher acceptance rate at many schools.\n- Results: Mid-December\n\n**Regular Decision:** January 1 - January 15, 2027\n- Most universities. Results: Late March / Early April\n\n**Rolling Admissions:** Varies (some as early as August 2026)\n- Apply early for the best chance. Decisions come within 4-8 weeks.\n\n**FAFSA Opens:** October 1, 2026\n- File early for maximum financial aid.\n\n**CSS Profile:** October 1, 2026\n- Required by many private universities for institutional aid.\n\nYou're in ${profile.grade} — ${profile.grade === 'Grade 12' ? 'you should be actively working on applications now.' : profile.grade === 'Grade 11' ? 'start preparing your essays and testing plan this year.' : 'focus on building your profile and taking rigorous courses.'}`,
    suggestions: ['Should I apply early decision?', 'Help me plan my timeline.', 'When should I take the SAT?'],
  };
}

function generateMajorResponse(profile: StudentProfile): AdvisorMessage {
  return {
    role: 'advisor',
    content: `You're interested in ${profile.intendedMajor}. Here's what that means for your application:\n\n**Why it matters:** Your major shapes which activities, projects, and competitions are most valuable. Admissions officers look for a "spike" — a deep, consistent interest — rather than a well-rounded but shallow profile.\n\n**For ${profile.intendedMajor}:**\n- Strengthen your quantitative or analytical work (research, projects, competitions)\n- Take the most advanced courses available in related subjects\n- Show real-world application (internships, independent projects, community impact)\n\n**If you're unsure:** Apply as "Undecided" — it's not a disadvantage at most schools. You can explore in your first year and declare later. Don't force a major you're not excited about.\n\nYour current activities (${profile.extracurriculars.join(', ') || 'none listed'}) ${profile.extracurriculars.some(a => a.toLowerCase().includes(profile.intendedMajor.toLowerCase().split(' ')[0])) ? 'align well' : 'could be more aligned'} with ${profile.intendedMajor}.`,
    suggestions: ['Should I apply undecided?', 'What careers match my major?', 'How do I show interest in my major?'],
  };
}

function generateInternationalResponse(profile: StudentProfile): AdvisorMessage {
  return {
    role: 'advisor',
    content: `As an international student${profile.country !== 'United States' ? ` from ${profile.country}` : ''}, you have unique considerations:\n\n**Financial:**\n- Many US universities are need-aware for international students (your ability to pay affects admission)\n- Look for need-blind schools: Harvard, Yale, Princeton, MIT, Amherst, Dartmouth\n- Scholarships like Chevening (UK), DAAD (Germany), and Fulbright are designed for international students\n\n**Testing:**\n- TOEFL or IELTS is required if English isn't your first language\n- Some schools accept Duolingo English Test\n- SAT/ACT may be required even if you have national exam scores\n\n**Visa:**\n- You'll need an F-1 visa. Your university will issue an I-20 form after admission.\n- Show proof of funds for one year of tuition + living expenses.\n\n**Application tips:**\n- Explain your grading system in the additional info section\n- Highlight any unique perspective or experience from your country\n- Apply early — visa processing can take months`,
    suggestions: ['Which US schools are need-blind for internationals?', 'Do I need to take the TOEFL?', 'Find scholarships for international students.'],
  };
}

function generateGapYearResponse(profile: StudentProfile): AdvisorMessage {
  return {
    role: 'advisor',
    content: `A gap year can strengthen your application if used intentionally. Here's how to think about it:\n\n**When it helps:**\n- You need time to improve your profile (SAT, research, activities)\n- You have a meaningful project, internship, or experience planned\n- You're applying to universities that value maturity and real-world experience\n\n**When it doesn't:**\n- You're just "taking a break" without a plan\n- Your grades are declining (better to apply while your record is strong)\n- You lose academic momentum\n\n**If you take one:**\n- Have a clear goal: research, work, volunteer, travel with purpose\n- Document everything — this becomes application material\n- Stay in touch with your recommenders so they can write fresh letters\n\nHarvard, Princeton, and many other universities actively encourage deferred admission and gap years. It's not a red flag if done well.`,
    suggestions: ['Should I take a gap year?', 'What should I do during a gap year?', 'How do I explain a gap year in my essay?'],
  };
}

function generateTransferResponse(profile: StudentProfile): AdvisorMessage {
  return {
    role: 'advisor',
    content: `Transferring is a viable path — many top universities accept 10-30% of their class through transfer admissions.\n\n**What matters most for transfers:**\n- **College GPA** (more important than high school GPA or SAT)\n- **Course rigor** at your current institution\n- **Why you're transferring** — a clear, specific reason (not "I want a better school")\n- **Fit** — how the target school's specific programs solve your current limitations\n\n**Timeline:**\n- Most transfer deadlines are March 1 - April 15 for fall entry\n- Some schools offer spring transfer (deadline October)\n- You typically apply after 1-2 years of college\n\n**Key tip:** Research each school's transfer credit policy. Some accept most credits, others are restrictive. This affects your graduation timeline and cost.`,
    suggestions: ['Which schools accept the most transfers?', 'How do I write a transfer essay?', 'Will my credits transfer?'],
  };
}

function generateWellnessResponse(profile: StudentProfile): AdvisorMessage {
  return {
    role: 'advisor',
    content: `I hear you. The admissions process is genuinely stressful, and it's okay to feel overwhelmed.\n\nHere's what I want you to remember:\n\n1. **Your worth is not your acceptance letter.** The college you attend doesn't determine your future. Many successful people went to schools you've never heard of.\n2. **Burnout is real.** If you're exhausted, taking a step back is more productive than pushing through. A 30-minute walk will help your essays more than another hour of anxious editing.\n3. **Comparison is the thief of joy.** Someone else's profile isn't your path. Your story is your advantage.\n4. **Ask for help.** Talk to a counselor, teacher, or trusted friend. You don't have to do this alone.\n\nIf you're feeling persistently anxious, depressed, or hopeless, please reach out to a mental health professional or a crisis line. Your health matters more than any application.\n\nTake a breath. Then tell me what's on your mind — I'm here to help you work through it.`,
    suggestions: ['How do I manage my time better?', 'I\'m overwhelmed — where do I start?', 'How do I balance school and applications?'],
  };
}

function generateGreetingResponse(profile: StudentProfile, analysis: ReturnType<typeof analyzeProfile>): AdvisorMessage {
  return {
    role: 'advisor',
    content: `Hi ${profile.fullName.split(' ')[0]}! I'm your personal admissions advisor.\n\nI've reviewed your profile:\n- **Profile score:** ${analysis.overall}/100\n- **Strongest areas:** ${analysis.strengths.join(', ')}\n- **Biggest opportunities:** ${analysis.weaknesses.join(', ')}\n\nI can help you with anything related to your university journey — finding the right schools, improving your profile, scholarships, research projects, competitions, essays, SAT prep, recommendations, interviews, deadlines, and more.\n\nWhat's on your mind?`,
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
