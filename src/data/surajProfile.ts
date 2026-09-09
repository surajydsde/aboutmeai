import { UserProfileData, SuggestionChip } from '../types';

export const SURAJ_PROFILE: UserProfileData = {
  name: 'Suraj Yadav',
  title: 'Full-Stack Developer (React.js, Next.js, Node.js, AWS)',
  location: 'Mumbai, India',
  email: 'surajyadav.sde@gmail.com',
  phone: '+91 8286683658',
  linkedin: 'linkedin.com/in/surajyadavsde',
  summary:
    'Full-Stack Developer with 7+ years of experience across the entire web application lifecycle — React.js/Next.js frontends, Node.js/Express.js and PHP backends, REST API design, MongoDB/MySQL data layers, and AWS (EC2, S3, RDS) infrastructure with Nginx/SSL deployment. Built full-stack applications from scratch (Cloudesign Technology Solutions) and delivered production frontend + backend integration work at TCS and eClerx, including a ~50% reduction in development effort through reusable components. TUM-certified in Generative AI with a personal full-stack AI agent project (RAG, LangGraph, Gemini).',
  skills: {
    frontend: ['React.js', 'Next.js', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap'],
    backend: ['Node.js', 'Express.js', 'PHP', 'REST API Design & Integration'],
    databases: ['MongoDB', 'MySQL', 'SQL'],
    cloudDevOps: ['AWS (EC2, S3, SES, RDS)', 'Nginx', 'SSL', 'Git', 'GitHub', 'CI/CD Pipelines'],
    aiGenAi: ['GenAI Fundamentals', 'Prompt Engineering for LLMs (TUM-certified)', 'RAG (Retrieval-Augmented Generation)', 'LangGraph', 'Gemini LLM'],
    testing: ['Mocha', 'Chai', 'Sinon', 'Jasmine', 'Unit Testing'],
    security: ['Multi-Factor Authentication (MFA)', 'Role-Based Access Control (RBAC)'],
  },
  experiences: [
    {
      company: 'Tata Consultancy Services (TCS)',
      role: 'Frontend Engineer',
      period: 'Jul 2025 – Present',
      location: 'Mumbai, India',
      highlights: [
        'Architect and develop frontend applications from scratch using React.js and modern web technologies, establishing component and state-management patterns adopted across the team.',
        'Design scalable, maintainable frontend solutions aligned with business and technical requirements.',
        'Integrate REST APIs and backend services to support secure, seamless user experiences.',
        'Implement Multi-Factor Authentication (MFA) and Role-Based Access Control (RBAC) for production applications.',
        'Configure and maintain CI/CD pipelines automating build, deployment, and release processes; deploy on Nginx across multiple environments.',
        'Collaborate with Product Owners, QA, backend engineers, and stakeholders across the development lifecycle.',
        'Earned client-nominated "Star of the Month" recognition for delivery quality and ownership.',
      ],
    },
    {
      company: 'eClerx Services Ltd',
      role: 'Associate Process Manager – React JS Developer',
      period: 'Nov 2022 – Jul 2025',
      location: 'Mumbai, India',
      highlights: [
        'Managed end-to-end SDLC — requirement analysis, estimation, development, testing, and deployment — for PayPal (global payments client) campaign applications.',
        'Developed and maintained React.js campaign landing pages for PayPal, replacing Pardot iframe forms with custom page-level handlers, lifting form submissions by ~30%.',
        'Engineered a reusable React component library, cutting development effort for future campaign implementations by ~50% and bringing 100+ dynamic webpages to a shared, maintainable pattern with full WCAG 2.1 accessibility compliance.',
        'Built AI-assisted automation tooling for testing and auditing workflows, reducing manual QA effort and improving delivery consistency.',
        'Designed and built a Chrome extension for automated webpage testing, cutting manual testing effort by ~40% — recognized internally as an Innovation Recognition.',
        'Mentored and onboarded 10+ engineers; recognized with eClerx\'s Value Award (Feb 2025) for mentoring and driving process improvements.',
      ],
    },
    {
      company: 'Cloudesign Technology Solutions',
      role: 'SDE – React JS / Full Stack Developer',
      period: 'Sep 2020 – Nov 2022',
      location: 'Mumbai, India',
      highlights: [
        'Developed and deployed scalable web applications using React.js, JavaScript, and AWS (EC2, S3, RDS).',
        'Built full-stack applications from scratch while collaborating with developers, designers, and stakeholders.',
        'Configured Nginx servers, SSL certificates, and deployment infrastructure while mentoring junior engineers.',
      ],
    },
    {
      company: 'Sanda Office Management Services Ltd',
      role: 'Software Developer',
      period: 'Aug 2019 – Feb 2020',
      highlights: [
        'Developed responsive websites and landing pages using HTML5, CSS3, Bootstrap, JavaScript, and jQuery.',
        'Built and maintained e-commerce websites using WooCommerce with secure payment gateway integrations.',
      ],
    },
    {
      company: 'Webeaters Technologies Pvt Ltd',
      role: 'Frontend Developer',
      period: 'Apr 2019 – Aug 2019',
      highlights: [
        'Developed responsive web applications using HTML, CSS, JavaScript, Bootstrap, PHP, and MySQL, translating Figma designs into interactive experiences.',
      ],
    },
    {
      company: 'OS Infosolutions Private Limited',
      role: 'PHP Developer',
      period: 'Jan 2018 – Apr 2019',
      highlights: [
        'Developed dynamic web applications using PHP, JavaScript, HTML, CSS, and MySQL; designed email templates and integrated Amazon SES.',
      ],
    },
  ],
  projects: [
    {
      title: 'RAG-Based AI Agent (Gemini LLM, LangGraph)',
      subtitle: 'Personal Full-Stack GenAI Project',
      description:
        'Built a Retrieval-Augmented Generation (RAG) agent implementing an agentic workflow with semantic memory using Gemini LLM and LangGraph. Features natural-language analysis of uploaded structured data (e.g. CSV datasets).',
      impact: 'Shared as a LinkedIn technical post reaching 10,671 organic impressions and 6 comments.',
      technologies: ['Gemini LLM', 'LangGraph', 'RAG', 'Python / Node.js', 'Vector Embeddings'],
    },
    {
      title: 'Automated Webpage Testing Chrome Extension',
      subtitle: 'Built at eClerx Services Ltd',
      description:
        'Designed and built a custom Google Chrome extension to automate frontend testing and auditing workflows across 100+ dynamic campaign pages.',
      impact: 'Cut manual testing effort by ~40% and won an internal Innovation Recognition.',
      technologies: ['Chrome Extension API', 'JavaScript', 'DOM Automation', 'QA Tooling'],
    },
  ],
  awards: [
    'Star of the Month — Tata Consultancy Services (client-nominated, for delivery quality and ownership)',
    'Value Award — eClerx Services (Feb 2025, for mentoring engineers and driving process improvements)',
    'Innovation Recognition — eClerx Services (for Chrome extension cutting QA effort by ~40%)',
  ],
  certifications: [
    'Skill of the Year 2025 on Generative AI — TUM Institute for LifeLong Learning (Technical University of Munich), delivered with eClerx Services (Munich, May 2025)',
    'JavaScript Testing with Jasmine — Udemy (Aug 2025)',
    'Node.js Unit Testing — Udemy (Aug 2025)',
  ],
  education:
    'BSc Information Technology — Nirmala Memorial Foundation College of Commerce & Science, University of Mumbai (2014–2017)',
};

export const DEFAULT_SUGGESTION_CHIPS: SuggestionChip[] = [
  { id: '1', text: 'Tell me about Suraj’s 7+ years background', category: 'experience' },
  { id: '2', text: 'What are his primary frontend & backend skills?', category: 'skills' },
  { id: '3', text: 'Explain his RAG GenAI project with Gemini & LangGraph', category: 'projects' },
  { id: '4', text: 'What impact did he make at eClerx & PayPal?', category: 'experience' },
  { id: '5', text: 'What awards and certifications has he received?', category: 'education' },
  { id: '6', text: 'What is his experience with AWS and CI/CD?', category: 'skills' },
  { id: '7', text: 'How can I get in touch with Suraj?', category: 'contact' },
];
