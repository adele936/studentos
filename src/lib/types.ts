export type StudentProfile = {
  fullName: string;
  email: string;
  grade: string;
  intendedMajor: string;
  country: string;
  gpa: number;
  satScore: number;
  olympiads: string[];
  research: string[];
  extracurriculars: string[];
  projects: string[];
  targetUniversities: string[];
};

export const defaultProfile: StudentProfile = {
  fullName: 'Alex Rivera',
  email: 'alex@example.com',
  grade: 'Grade 11',
  intendedMajor: 'Computer Science',
  country: 'United States',
  gpa: 3.7,
  satScore: 1380,
  olympiads: ['AMC 12 Participant'],
  research: ['Independent AI Study'],
  extracurriculars: ['Coding Club Member', 'Volunteer Tutor', 'Robotics Team'],
  projects: ['Mobile App for Local Business'],
  targetUniversities: ['University of Toronto', 'Georgia Tech'],
};

export function getProfileInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function getAvatarColor(name: string): string {
  const colors = ['#1359b5', '#d64f37', '#2b8a5e', '#a28b00', '#7b3fc4', '#c2547a', '#1f6f8b', '#b5560e'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
