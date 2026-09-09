import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json({ limit: '10mb' }));

const DEFAULT_PROFILE_CONTEXT = `
Candidate Profile: Suraj Yadav
Role: Full-Stack Developer (React.js, Next.js, Node.js, AWS)
Location: Mumbai, India
Phone: +91 8286683658
Email: surajyadav.sde@gmail.com
LinkedIn: linkedin.com/in/surajyadavsde

PROFESSIONAL SUMMARY:
Full-Stack Developer with 7+ years of experience across the entire web application lifecycle — React.js/Next.js frontends, Node.js/Express.js and PHP backends, REST API design, MongoDB/MySQL data layers, and AWS (EC2, S3, RDS) infrastructure with Nginx/SSL deployment. Built full-stack applications from scratch (Cloudesign Technology Solutions) and delivered production frontend + backend integration work at TCS and eClerx, including a ~50% reduction in development effort through reusable components. TUM-certified in Generative AI with a personal full-stack AI agent project (RAG, LangGraph, Gemini).

TECHNICAL SKILLS:
- Frontend: React.js, Next.js, JavaScript (ES6+), TypeScript, HTML5, CSS3, Tailwind CSS, Bootstrap
- Backend & APIs: Node.js, Express.js, PHP, REST API design & integration
- Databases: MongoDB, MySQL, SQL
- Cloud & DevOps: AWS (EC2, S3, SES, RDS), Nginx, SSL, Git, GitHub, CI/CD
- Testing: Mocha, Chai, Sinon, Unit Testing
- AI / GenAI: GenAI Fundamentals, Prompt Engineering for LLMs (TUM-certified); RAG, LangGraph, Gemini LLM (hands-on project)
- Security: Multi-Factor Authentication (MFA), Role-Based Access Control (RBAC)

CORE COMPETENCIES:
Frontend Architecture, Component-Based Development, REST API Integration, Authentication & Authorization, Responsive Web Design, Accessibility (WCAG 2.1), Performance Optimization, CI/CD Automation, Code Reviews, Agile Scrum, Cross-Functional Collaboration, Mentoring

WORK EXPERIENCE:
1. Frontend Engineer — Tata Consultancy Services (TCS) (Jul 2025 – Present)
   - Architect and develop frontend applications from scratch using React.js and modern web technologies, establishing component and state-management patterns adopted across the team.
   - Design scalable, maintainable frontend solutions aligned with business and technical requirements.
   - Integrate REST APIs and backend services to support secure, seamless user experiences.
   - Implement Multi-Factor Authentication (MFA) and Role-Based Access Control (RBAC) for production applications.
   - Configure and maintain CI/CD pipelines automating build, deployment, and release processes; deploy on Nginx across multiple environments.
   - Collaborate with Product Owners, QA, backend engineers, and stakeholders across the development lifecycle; participate in code reviews to improve quality, performance, and maintainability.
   - Earned client-nominated "Star of the Month" recognition for delivery quality and ownership.

2. Associate Process Manager – React JS Developer — eClerx Services Ltd (Nov 2022 – Jul 2025)
   - Managed end-to-end SDLC — requirement analysis, estimation, development, testing, and deployment — for PayPal (global payments client) campaign applications.
   - Developed and maintained React.js campaign landing pages for PayPal, replacing Pardot iframe forms with custom page-level handlers, lifting form submissions by ~30%.
   - Engineered a reusable React component library, cutting development effort for future campaign implementations by ~50% and bringing 100+ dynamic webpages to a shared, maintainable pattern with full WCAG 2.1 accessibility compliance.
   - Built AI-assisted automation tooling for testing and auditing workflows, reducing manual QA effort and improving delivery consistency.
   - Designed and built a Chrome extension for automated webpage testing, cutting manual testing effort by ~40% — recognized internally as an Innovation Recognition.
   - Mentored and onboarded 10+ engineers; recognized with eClerx's Value Award (Feb 2025) for mentoring and driving process improvements.

3. SDE – React JS / Full Stack Developer — Cloudesign Technology Solutions (Sep 2020 – Nov 2022)
   - Developed and deployed scalable web applications using React.js, JavaScript, and AWS (EC2, S3, RDS).
   - Built full-stack applications from scratch while collaborating with developers, designers, and stakeholders.
   - Configured Nginx servers, SSL certificates, and deployment infrastructure while mentoring junior engineers.

4. Software Developer — Sanda Office Management Services Ltd (Aug 2019 – Feb 2020)
   - Developed responsive websites and landing pages using HTML5, CSS3, Bootstrap, JavaScript, and jQuery.
   - Built and maintained e-commerce websites using WooCommerce with secure payment gateway integrations.

5. Frontend Developer — Webeaters Technologies Pvt Ltd (Apr 2019 – Aug 2019)
   - Developed responsive web applications using HTML, CSS, JavaScript, Bootstrap, PHP, and MySQL, translating Figma designs into interactive experiences.

6. PHP Developer — OS Infosolutions Private Limited (Jan 2018 – Apr 2019)
   - Developed dynamic web applications using PHP, JavaScript, HTML, CSS, and MySQL; designed email templates and integrated Amazon SES.

FEATURED PROJECTS:
- Personal Project — RAG-Based AI Agent (Gemini LLM, LangGraph):
  Built a Retrieval-Augmented Generation (RAG) agent on personal time using Gemini LLM and LangGraph with semantic memory, natural language analysis of uploaded datasets (e.g. CSVs). Reached 10,671 organic impressions on LinkedIn.
- Chrome Extension for Automated Webpage Testing (built at eClerx):
  Automated webpage testing, reducing manual QA effort by ~40%. Awarded internal Innovation Recognition.

AWARDS & RECOGNITION:
- Star of the Month — Tata Consultancy Services (client-nominated)
- Value Award — eClerx Services (Feb 2025) for mentoring and driving process improvements
- Innovation Recognition — eClerx Services for test automation tool

CERTIFICATIONS:
- "Skill of the Year 2025 on Generative AI" — TUM Institute for LifeLong Learning (Technical University of Munich) in cooperation with eClerx Services (Munich, May 2025)
- JavaScript Testing with Jasmine — Udemy, Aug 2025
- Node.js Unit Testing — Udemy, Aug 2025

EDUCATION:
- BSc Information Technology — Nirmala Memorial Foundation College of Commerce & Science, University of Mumbai (2014–2017)
`;

let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('AI_NOT_CONFIGURED');
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasApiKey: Boolean(process.env.GEMINI_API_KEY), model: 'gemini-3.6-flash' });
});

app.get('/api/profile', (_req, res) => {
  res.json({
    profile: DEFAULT_PROFILE_CONTEXT,
    name: 'Suraj Yadav',
    title: 'Full-Stack Developer (React.js, Next.js, Node.js, AWS)',
    location: 'Mumbai, India',
    email: 'surajyadav.sde@gmail.com',
    phone: '+91 8286683658',
    linkedin: 'linkedin.com/in/surajyadavsde',
    experienceYears: '7+',
    currentCompany: 'Tata Consultancy Services (TCS)',
  });
});

app.get('/api/suggestions', (_req, res) => {
  res.json({
    suggestions: [
      { id: '1', text: "Summarize Suraj's background & core skills" },
      { id: '2', text: "Tell me about Suraj's RAG AI Agent project" },
      { id: '3', text: 'What did Suraj achieve at PayPal / eClerx?' },
      { id: '4', text: 'What awards and certifications does Suraj hold?' },
      { id: '5', text: "What is Suraj's experience with AWS and DevOps?" },
      { id: '6', text: 'How can I contact Suraj for career opportunities?' },
    ],
  });
});

app.post('/api/chat', async (req, res) => {
  const { message, history = [], customProfile } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'A message string is required.' });
  }

  const profileToUse =
    typeof customProfile === 'string' && customProfile.trim().length > 0
      ? customProfile
      : DEFAULT_PROFILE_CONTEXT;

  const systemInstruction = `You are the personal AI Assistant and Knowledge Agent representing Suraj Yadav, an experienced Full-Stack Developer (7+ years) with deep expertise in React.js, Next.js, Node.js, Express, AWS, and Generative AI (Gemini, LangGraph, RAG).

Your core objectives:
1. Answer any and all questions about Suraj Yadav accurately, eloquently, and thoroughly based on his authentic resume and profile below.
2. Highlight his measurable engineering achievements (e.g. ~50% development effort reduction via reusable React libraries, ~40% QA testing reduction via his custom Chrome extension, ~30% form submission lift for PayPal campaign pages).
3. If asked about his AI background, highlight his Technical University of Munich (TUM) "Skill of the Year 2025 on Generative AI" certification, his RAG-based AI Agent using Gemini LLM and LangGraph, and prompt engineering expertise.
4. Maintain full conversational context and memory across the ongoing chat thread. If the user refers to previous messages (e.g., "tell me more about that project", "what about his education?", "how long was he there?"), understand pronouns and context seamlessly.
5. Provide clear, well-structured responses formatted with markdown (clean bullet points, bold headers, and concise paragraphs).
6. Be courteous, highly professional, warm, and proactive. If asked for his contact details, share his email (surajyadav.sde@gmail.com), phone (+91 8286683658), and LinkedIn (linkedin.com/in/surajyadavsde).
7. If the user asks a general coding, architectural, or technical question (e.g. React vs Next.js, AWS deployment, RAG patterns), answer expertly from Suraj's perspective and engineering philosophy!

Here is Suraj Yadav's complete verified profile and background:
"""
${profileToUse}
"""`;

  try {
    const ai = getGeminiClient();

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(history)) {
      for (const item of history) {
        if (item && item.role && item.text) {
          contents.push({
            role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }],
          });
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'];
    let lastError: any = null;
    let replyText = '';

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: { systemInstruction, temperature: 0.7 },
        });
        if (response.text) { replyText = response.text; break; }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!replyText && lastError) throw lastError;

    replyText = replyText || "I'm here to share insights about Suraj Yadav's experience and background. What would you like to know?";

    return res.json({ reply: replyText });
  } catch (error: any) {
    const msg = String(error?.message || '');
    const code = error?.status || error?.statusCode || error?.code;
    console.error('Gemini error — code:', code, 'message:', msg);

    let reply: string;
    if (code === 401 || code === 403 || msg.includes('UNAUTHENTICATED') || msg.includes('API_KEY') || msg.includes('AI_NOT_CONFIGURED')) {
      reply = "I'm not configured correctly on this site. Please contact the owner.";
    } else if (code === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      reply = "I'm getting too many requests right now. Please try again in a minute.";
    } else if (code === 404 || msg.includes('NOT_FOUND') || msg.includes('not found')) {
      reply = "AI model configuration error. Please contact the site owner.";
    } else {
      reply = "I'm having trouble connecting right now. Please try again in a moment.";
    }

    return res.status(500).json({ error: 'AI service unavailable.', reply });
  }
});

export default app;
