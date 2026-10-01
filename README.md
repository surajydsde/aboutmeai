# Suraj Yadav — Full-Stack Developer & AI Portfolio

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-v4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-31_Passing-brightgreen?logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An interactive, production-grade Android Material Design 3 portfolio application and AI Knowledge Agent representing **Suraj Yadav** — Full-Stack Developer with 7+ years of experience across React.js, Next.js, Node.js, Express, AWS, and TUM-certified Generative AI.

---

## 🌟 What This Application Does

This application provides a conversational and visual portfolio experience:

1. **AI Knowledge Agent**: Powered by **Google Gemini 3.8 Flash** via `@google/genai`, the agent answers technical, career, and architectural questions about Suraj Yadav in real time using grounded resume context.
2. **Material Design 3 Android Atmosphere**: Styled after modern Android / Google Pixel design language with gesture bars, top app bar, dynamic bottom navigation, and pill badges.
3. **Interactive Resume & Bio**: Comprehensive career timeline spanning Tata Consultancy Services (TCS), eClerx Services (PayPal), Cloudesign Technology Solutions, and academic credentials.
4. **Key Metric Showcases**:
   - **50% Effort Reduction**: Built reusable React component libraries adopted across 100+ dynamic webpages.
   - **40% QA Reduction**: Created an automated testing Chrome Extension that won an internal Innovation Recognition.
   - **30% Conversion Lift**: Replaced legacy forms with custom React state handlers for PayPal campaign pages.
   - **10,671 Impressions**: Personal RAG AI agent project built with Gemini LLM and LangGraph.
5. **Native Sharing & Deep Linking**: One-click sharing via Web Share API (`navigator.share`) and clipboard fallback, with URL query parameter support (`?tab=profile`) for easy sharing with recruiters and peers.
6. **Live, editable profile (owner mode)**: After a server-verified passcode, the owner edits the Resume tab in place. Saving publishes to every visitor and updates the AI's knowledge at the same time — the resume and the AI always share one source of data.

---

## 📐 Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (React 19 + Vite)                │
│  - Android Frame Shell & Material Design 3 Components       │
│  - AI Chat View with Markdown & Suggestion Chips           │
│  - Interactive Profile & Experience Timeline               │
│  - Admin Passcode Verification Modal                        │
│  - Web Share API & URL Search Params Routing               │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                  Server (Express + Node 22)                │
│  - REST Endpoints: /api/chat, /api/profile, /api/health    │
│  - Model Cascade: 3.8-flash -> 3.6-flash -> 3.5-flash-lite │
│  - Secure Server-Side Gemini API Key Management            │
│  - Production Static Asset Serving from dist/              │
└──────────────────────────────┬──────────────────────────────┘
                               │ Google GenAI SDK
┌──────────────────────────────▼──────────────────────────────┐
│                    Google Gemini API                        │
│  - Grounded System Instructions                            │
│  - Conversational History Multi-Turn Context               │
└─────────────────────────────────────────────────────────────┘
```

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with custom Material 3 Dark theme palette
- **Icons**: Lucide React
- **Animations**: Motion (`motion/react`)
- **Markdown Rendering**: `react-markdown` + `remark-gfm`

### Backend
- **Server**: Express 4 with TypeScript (`tsx` in dev mode)
- **AI SDK**: `@google/genai` (Node.js SDK)
- **AI Model**: `gemini-3.8-flash`, falling back to `gemini-3.6-flash` and `gemini-3.5-flash-lite` (no fallback on quota or auth errors, since they share one key)
- **Profile storage**: one private JSON file in Vercel Blob (`@vercel/blob`)

### Testing
- **Test Runner**: Vitest 5
- **DOM Simulation**: jsdom
- **Testing Utilities**: `@testing-library/react`, `@testing-library/jest-dom`

---

## 📁 Project Structure

```
├── .github/
│   ├── workflows/
│   │   └── ci.yml                 # GitHub Actions CI pipeline (lint, test, build)
│   └── pull_request_template.md   # Standard PR checklist
├── src/
│   ├── components/
│   │   ├── AdminAuthModal.tsx     # Owner passcode dialog (verified by the server)
│   │   ├── ProfileEditor.tsx      # Owner editor for the live profile
│   │   ├── AndroidFrame.tsx       # Pixel device frame with status/gesture bars
│   │   ├── ChatView.tsx           # Multi-turn conversational interface
│   │   ├── ContextView.tsx        # Owner view of the AI's generated knowledge
│   │   ├── MaterialBottomNav.tsx  # Dynamic M3 bottom navigation bar
│   │   ├── MaterialTopBar.tsx     # M3 app bar with share, reset, & owner lock
│   │   └── ProfileView.tsx        # Career timeline, metrics, & skills
│   ├── data/
│   │   └── surajProfile.ts        # Starting profile (used until the first save)
│   ├── lib/
│   │   ├── profile.ts             # Shared: profile validation + AI context builder
│   │   ├── api.ts                 # Browser API client
│   │   └── ProfileContext.ts      # React context for the live profile
│   ├── test/
│   │   ├── api.test.ts            # API formatting and share URL tests
│   │   ├── components.test.tsx    # Component render & interaction tests
│   │   ├── profileData.test.ts    # Resume data consistency tests
│   │   └── setup.ts               # Testing library setup
│   ├── types.ts                   # Shared TypeScript interfaces & types
│   ├── App.tsx                    # Root application state & router
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global Tailwind CSS imports
├── public/                        # Static assets
├── api/index.ts                   # Express API (Vercel serverless function)
├── server/                        # Profile store, owner auth, rate limiting
├── server.ts                      # Local/Cloud Run server wrapper
├── vite.config.ts                 # Vite & Vitest configuration
├── package.json                   # Project dependencies and npm scripts
├── metadata.json                  # Application metadata & capabilities
├── GEMINI.md                      # AI Studio Agent Persona & Conventions
├── AGENTS.md                      # Persistent guidelines for coding agents
├── .env.example                   # Environment variable template
└── README.md                      # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.x or higher
- **npm** or **bun**
- **Google Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install
```bash
git clone https://github.com/surajydsde/aboutmeai.git
cd aboutmeai
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API key:
```env
GEMINI_API_KEY="AIzaSy..."
OWNER_PASSCODE="choose-a-long-unique-passcode"
```

### 3. Run in Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

The repository includes a comprehensive test suite covering data structures, component behavior, passcode authentication, and API contract logic.

```bash
# Run unit & component tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run linter
npm run lint
```

---

## 🚢 Deployment

### Deploy to Google Cloud Run / Google AI Studio
1. Build the production package:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```
3. The server automatically serves optimized assets from `dist/` and handles API requests under `/api/*`.

### Deploy to Vercel
1. Set the root directory to project root.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add Environment Variables: `GEMINI_API_KEY` and `OWNER_PASSCODE`.
6. Storage → **Create / Connect a Blob store** to the project (this adds `BLOB_READ_WRITE_TOKEN`).
7. Redeploy. `GET /api/health` should show `ownerLoginConfigured: true` and `persistentStorage: true`.

---

## 🔐 Owner Mode: Editing the Live Profile
1. Tap the lock icon (top bar) or **Owner Settings** at the bottom of the Resume tab.
2. Enter the passcode. It is checked on the server against `OWNER_PASSCODE`, which returns a signed session token (12 hours).
3. Tap **Edit profile**, change anything — basics, skills, experience, projects, awards, education, and private **Notes for the AI** — then **Save & publish**.
4. The change is stored in Vercel Blob. Every visitor's Resume tab and every AI answer use it right away.

The **AI Context** tab (owner only) shows exactly what the AI is told, generated from the profile.
`src/data/surajProfile.ts` is only the starting profile, used until the first save.

---

## 👨‍💻 Candidate Information
- **Name**: Suraj Yadav
- **Title**: Full-Stack Developer (React.js, Next.js, Node.js, AWS)
- **Location**: Mumbai, India
- **Email**: [surajyadav.sde@gmail.com](mailto:surajyadav.sde@gmail.com)
- **LinkedIn**: [linkedin.com/in/surajyadavsde](https://linkedin.com/in/surajyadavsde)
- **Phone**: +91 8286683658

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
