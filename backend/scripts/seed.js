import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB } from '../config/db.js';
import { Opportunity, User } from '../models/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, '../.env') });
dotenv.config();

const samples = [
  { title: 'Product Engineering Intern', organization: 'Northstar Labs', category: 'Internship', description: 'Work with a small product team to ship customer-facing features, write tests, and learn the full product development cycle.', location: 'Remote', eligibility: 'Undergraduate students graduating in 2027 or later', requiredSkills: ['React', 'JavaScript', 'CSS'], deadline: '2027-01-18', applicationLink: 'https://example.com/opportunities/product-intern', benefits: ['Paid internship', 'Mentorship', 'Flexible hours'], applicationProcedure: 'Submit your resume and a short note about a project you are proud of.' },
  { title: 'Campus Climate Buildathon', organization: 'Open Planet Collective', category: 'Hackathon', description: 'A weekend buildathon for practical tools that help local communities respond to climate challenges.', location: 'Online', eligibility: 'Open to student teams of 2-5', requiredSkills: ['Design', 'Python', 'Data'], deadline: '2026-12-12', applicationLink: 'https://example.com/opportunities/climate-buildathon', benefits: ['Mentor sessions', 'Project grants', 'Demo day'], applicationProcedure: 'Register your team and share a one-paragraph idea.' },
  { title: 'Future Makers Scholarship', organization: 'Bright Futures Fund', category: 'Scholarship', description: 'Annual support for students building useful technology for their communities.', location: 'United States', eligibility: 'Enrolled undergraduate students with a community project', requiredSkills: ['Leadership', 'Research'], deadline: '2027-02-05', applicationLink: 'https://example.com/opportunities/future-makers', benefits: ['Up to $5,000 award', 'Alumni network'], applicationProcedure: 'Submit a transcript, project summary, and one reference.' },
  { title: 'Applied AI Research Assistant', organization: 'Cedar University Lab', category: 'Research', description: 'Join a faculty team exploring responsible language technology and evaluation methods.', location: 'Hybrid', eligibility: 'Sophomores and above; 8 hours per week', requiredSkills: ['Python', 'Machine Learning', 'Research'], deadline: '2027-01-08', applicationLink: 'https://example.com/opportunities/applied-ai', benefits: ['Faculty mentorship', 'Research credit'], applicationProcedure: 'Email a resume and a brief statement of research interests.' },
  { title: 'Frontend Developer Intern', organization: 'Maple Digital Studio', category: 'Internship', description: 'Build accessible web interfaces, collaborate on design reviews, and contribute to a production React application.', location: 'Remote', eligibility: 'Current undergraduate students; part-time during the semester', requiredSkills: ['React', 'JavaScript', 'Accessibility'], deadline: '2027-02-20', applicationLink: 'https://example.com/opportunities/frontend-intern', benefits: ['Paid internship', 'Mentorship', 'Flexible schedule'], applicationProcedure: 'Submit a resume and links to projects or a portfolio.' },
  { title: 'Data Analytics Intern', organization: 'Summit Insights', category: 'Internship', description: 'Help clean datasets, build dashboards, and communicate findings to a small analytics team.', location: 'Hybrid', eligibility: 'Undergraduate students studying computer science, statistics, or a related field', requiredSkills: ['SQL', 'Python', 'Data Visualization'], deadline: '2027-03-01', applicationLink: 'https://example.com/opportunities/data-analytics-intern', benefits: ['Paid internship', 'Project ownership', 'Career coaching'], applicationProcedure: 'Submit a resume and a short example of a data project.' },
  { title: 'Cybersecurity Intern', organization: 'Harbor Security Group', category: 'Internship', description: 'Support security reviews, document findings, and learn defensive security practices with an experienced team.', location: 'Remote', eligibility: 'Students with an interest in defensive cybersecurity; no professional experience required', requiredSkills: ['Networking', 'Linux', 'Security Fundamentals'], deadline: '2027-03-15', applicationLink: 'https://example.com/opportunities/security-intern', benefits: ['Paid internship', 'Mentorship', 'Training sessions'], applicationProcedure: 'Submit a resume and a brief note about your interest in security.' },
  { title: 'UX Design Intern', organization: 'Juniper Learning', category: 'Internship', description: 'Research student needs, create wireframes, and test improvements to a digital learning product.', location: 'Hybrid', eligibility: 'Enrolled students with design coursework or portfolio projects', requiredSkills: ['Figma', 'User Research', 'Prototyping'], deadline: '2027-03-22', applicationLink: 'https://example.com/opportunities/ux-design-intern', benefits: ['Paid internship', 'Portfolio-ready project', 'Mentorship'], applicationProcedure: 'Share a resume and a portfolio with one or more design projects.' },
  { title: 'Responsible AI Hackathon', organization: 'Civic Future Network', category: 'Hackathon', description: 'Create a prototype that helps people understand or evaluate the impact of AI systems in their communities.', location: 'Online', eligibility: 'Student teams of 1-5; beginners are welcome', requiredSkills: ['AI', 'Research', 'Prototyping'], deadline: '2027-01-10', applicationLink: 'https://example.com/opportunities/responsible-ai-hackathon', benefits: ['Mentor sessions', 'Online showcase', 'Team prizes'], applicationProcedure: 'Register a team and submit a short project idea.' },
  { title: 'Open Source for Good Hackathon', organization: 'Community Code Alliance', category: 'Hackathon', description: 'Collaborate on an open-source prototype addressing a local nonprofit or community need.', location: 'Online', eligibility: 'Open to student developers and designers working in teams of 2-4', requiredSkills: ['Git', 'JavaScript', 'Teamwork'], deadline: '2027-01-25', applicationLink: 'https://example.com/opportunities/open-source-hackathon', benefits: ['Open-source mentorship', 'Project showcase', 'Prizes'], applicationProcedure: 'Register your team and choose a community challenge.' },
  { title: 'Smart Campus Innovation Challenge', organization: 'CampusWorks Lab', category: 'Hackathon', description: 'Design a practical tool to improve campus accessibility, sustainability, or student services.', location: 'Hybrid', eligibility: 'Current college students; teams of up to 5', requiredSkills: ['Product Design', 'Web Development', 'Presentation'], deadline: '2027-02-08', applicationLink: 'https://example.com/opportunities/smart-campus-challenge', benefits: ['Faculty mentors', 'Demo day', 'Prototype grants'], applicationProcedure: 'Register your team and describe the problem you plan to solve.' },
  { title: 'HealthTech Student Hackathon', organization: 'WellSpring Innovation Hub', category: 'Hackathon', description: 'Build a prototype for a health or wellness challenge with guidance from volunteer mentors.', location: 'Online', eligibility: 'Student teams of 2-5; cross-disciplinary teams are encouraged', requiredSkills: ['Healthcare Innovation', 'Design', 'Programming'], deadline: '2027-02-22', applicationLink: 'https://example.com/opportunities/healthtech-hackathon', benefits: ['Expert mentors', 'Project showcase', 'Team awards'], applicationProcedure: 'Register a team and submit a brief description of your idea.' },
];

try {
  await connectDB();
  let admin = await User.findOne({ role: 'admin' });
  if (!admin && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    admin = await User.create({ name: process.env.ADMIN_NAME || 'OpportunityHub Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin' });
    console.log(`Created admin account: ${admin.email}`);
  }
  if (!admin) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env to seed opportunities.');
  const existing = await Opportunity.find({
    $or: samples.map(({ title, organization }) => ({ title, organization })),
  }).select('title organization');
  const existingKeys = new Set(existing.map(({ title, organization }) => `${title}\0${organization}`));
  const newSamples = samples.filter(({ title, organization }) => !existingKeys.has(`${title}\0${organization}`));
  if (newSamples.length) {
    await Opportunity.insertMany(newSamples.map((sample) => ({ ...sample, createdBy: admin.id })));
    console.log(`Inserted ${newSamples.length} sample opportunities.`);
  } else console.log('All sample opportunities already exist; no changes were made.');
  await (await import('mongoose')).default.disconnect();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
