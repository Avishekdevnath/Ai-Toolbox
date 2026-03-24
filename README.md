# AI Toolbox

> A production-grade, full-stack SaaS platform delivering 17 AI-powered and utility tools — built with Next.js 15, TypeScript, MongoDB, and OpenAI.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Mongoose](https://img.shields.io/badge/Mongoose-v8-880000?logo=mongoose&logoColor=white)](https://mongoosejs.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?logo=openai&logoColor=white)](https://openai.com)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?logo=google&logoColor=white)](https://deepmind.google/gemini)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![Zod](https://img.shields.io/badge/Zod-v4-3E67B1?logo=zod&logoColor=white)](https://zod.dev)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion)
[![Radix UI](https://img.shields.io/badge/Radix_UI-headless-161618?logo=radixui&logoColor=white)](https://www.radix-ui.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io&logoColor=white)](https://socket.io)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-media-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![Storybook](https://img.shields.io/badge/Storybook-9-FF4785?logo=storybook&logoColor=white)](https://storybook.js.org)

---

## Overview

AI Toolbox is an all-in-one productivity platform that gives users instant access to AI-powered analysis tools, financial planning modules, career tools, and everyday utilities — all under one roof. It features a full authentication system, user and admin dashboards, analytics, feedback collection, and a content management system for tools, forms, and code snippets.

This project demonstrates real-world engineering across the full stack: secure auth flows, AI integrations, role-based access control, database design, and polished UI — making it a strong showcase for modern web development practices.

---

## Live Features

### AI Tools
| Tool | Description |
|---|---|
| SWOT Analysis | AI-generated business analysis with export |
| Finance Advisor | 8-module financial planning suite (debt, tax, retirement, investment) |
| Diet Planner | Personalized AI meal plans with nutrition analysis |
| Resume Reviewer | ATS-optimized resume feedback with industry benchmarking |
| Mock Interviewer | Role-based interview simulation with scoring |
| Job-Specific Interviewer | Interview prep tailored to real job postings |
| Age Calculator | Life milestone analysis with health recommendations |
| Quote Generator | Mood and topic-based AI quote generation |
| Product Price Tracker | Price history and AI-powered deal detection |

### Utility Tools
| Tool | Description |
|---|---|
| URL Shortener | Custom aliases, click analytics, QR code generation |
| QR Code Generator | Custom styled QR codes with download options |
| Password Generator | Cryptographically secure password generation |
| Unit Converter | 7 categories including live currency rates |
| Word Counter | Readability scoring and detailed text analysis |
| Tip Calculator | Bill splitting with AI-suggested tip amounts |
| Forms (Beta) | Drag-and-drop form builder with public sharing and analytics |
| Share Code | Syntax-highlighted code snippet sharing with Monaco editor |

---

## Technical Highlights

- **Authentication** — Custom JWT-based auth with bcrypt password hashing, rate limiting (5 attempts / 15-min window), session validation, and security question recovery
- **Dual auth systems** — Separate regular user (`/sign-in`) and admin panel (`/admin`) auth flows with independent session management
- **Role-based access control** — `user`, `admin`, `super_admin`, `moderator` roles with granular permission sets
- **Admin panel** — Full CMS: user management, tool enable/disable toggles, analytics dashboard, feedback review, system settings, and audit logs
- **Analytics** — Visitor identity tracking, page visit recording, tool usage metrics, and an analytics dashboard with charts
- **Feedback system** — In-app feedback collection surfaced in the admin panel
- **Form builder** — Full-featured form system with quiz scoring, timer support, identity collection, and CSV response export
- **Code sharing** — Public snippet platform with Monaco editor, syntax highlighting, and shareable URLs
- **AI integration** — OpenAI GPT-4 for analysis, resume review, interview evaluation, diet planning, and quote generation
- **PDF parsing** — Resume text extraction from PDF uploads using pdf.js
- **Security** — HTTP-only cookies, SameSite protection, XSS/clickjacking headers, CSRF prevention, input validation with Zod

---

## Tech Stack

### Core
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Runtime | React 19 |
| Styling | Tailwind CSS v4 |
| Database | MongoDB Atlas + Mongoose ODM |
| Auth | Custom JWT + bcryptjs |
| Deployment | Vercel + Vercel Blob Storage |

### AI & Machine Learning
| Library | Purpose |
|---|---|
| OpenAI SDK v6 | GPT-4 analysis, resume review, interview evaluation, diet planning |
| Google Generative AI | Gemini model integration |
| Google Cloud Vision | Image recognition and OCR |
| Tesseract.js | Client-side OCR for document scanning |
| pdf.js (pdfjs-dist) | PDF parsing for resume uploads |
| Mammoth | Word document (.docx) extraction |

### UI & Components
| Library | Purpose |
|---|---|
| Radix UI | Accessible headless components (Dialog, Dropdown, Switch, Avatar, Checkbox…) |
| Headless UI | Additional accessible UI primitives |
| Lucide React | Icon system (500+ icons) |
| Framer Motion | Animations and page transitions |
| Recharts | Analytics charts and data visualization |
| Monaco Editor | VS Code-grade code editor for snippet sharing |
| React Syntax Highlighter | Syntax-highlighted code display |
| clsx + tailwind-merge | Conditional class composition |
| class-variance-authority | Type-safe component variant system |

### State & Data
| Library | Purpose |
|---|---|
| Redux Toolkit | Global state management |
| React Redux | React bindings for Redux |
| Zod v4 | Runtime schema validation at all API boundaries |
| Axios | HTTP client for external API calls |
| date-fns | Date manipulation and formatting |
| uuid | Unique ID generation |

### Backend & Infrastructure
| Library | Purpose |
|---|---|
| MongoDB Driver v6 | Direct MongoDB queries for complex aggregations |
| Mongoose v8 | ODM with schema modeling and static methods |
| jsonwebtoken | JWT signing and verification |
| Nodemailer | Transactional email (password reset, welcome emails) |
| Cloudinary | Profile picture upload and CDN delivery |
| Socket.io | Real-time features |
| Multer | Multipart file upload handling |

### Export & Document Generation
| Library | Purpose |
|---|---|
| jsPDF + jspdf-autotable | PDF report generation for financial tools |
| html2canvas | Screenshot-to-canvas for image exports |
| canvas | Server-side canvas rendering |
| xlsx | Excel spreadsheet export |

### Testing & Quality
| Library | Purpose |
|---|---|
| Vitest | Unit and integration test runner |
| Jest + jest-environment-jsdom | DOM-based testing environment |
| Testing Library (React) | Component testing utilities |
| Playwright | End-to-end browser testing |
| Storybook 9 | Component development and visual testing |
| ESLint + TypeScript ESLint | Static analysis and code quality |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # REST API endpoints
│   │   ├── auth/           # Login, register, logout, session validation
│   │   ├── admin/          # Admin-only API routes
│   │   ├── analyze/        # AI analysis endpoints
│   │   ├── tools/          # Tool management
│   │   └── ...
│   ├── admin/              # Admin panel pages
│   ├── dashboard/          # User dashboard pages
│   └── tools/              # Public tool pages
├── components/
│   ├── admin/              # Admin UI components
│   ├── dashboard/          # Dashboard layout, header, sidebar
│   ├── forms/              # Form builder components
│   ├── tools/              # Individual tool components
│   └── ui/                 # Shared UI primitives
├── lib/                    # Business logic & services
│   ├── auth/               # JWT utilities
│   ├── authService.ts      # User authentication service
│   ├── adminAuthService.ts # Admin authentication service
│   └── ...
├── models/                 # Mongoose models
├── schemas/                # Zod validation schemas
└── data/
    └── tools.ts            # Tool definitions registry
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key

### Installation

```bash
git clone https://github.com/your-username/ai-toolbox.git
cd ai-toolbox
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Auth
JWT_SECRET=your-jwt-secret-here

# OpenAI
OPENAI_API_KEY=sk-...

# Cloudinary (optional — for profile pictures)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (optional — for password reset)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
```

### Database Setup

```bash
# Seed all tools
node scripts/seed-tools.js

# Create admin and demo accounts
node scripts/seed-accounts.js
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default Accounts

After running `seed-accounts.js`:

| Role | Email | Password | Portal |
|---|---|---|---|
| Admin user | admin@aitoolbox.com | Admin123! | /sign-in |
| Demo user | demo@aitoolbox.com | Demo123! | /sign-in |
| Super admin | superadmin@aitoolbox.com | SuperAdmin123! | /admin |
| Admin | admin@aitoolbox.com | Admin123! | /admin |

---

## Scripts

| Script | Purpose |
|---|---|
| `node scripts/seed-tools.js` | Populate tools collection (17 tools) |
| `node scripts/seed-accounts.js` | Create admin and demo user accounts |
| `node scripts/clear-database.js [collection\|all]` | Clear specific or all collections |
| `node scripts/check-database-connection.js` | Verify MongoDB connectivity |
| `node scripts/populate-about-info.js` | Seed about page content |
| `node scripts/populate-contact-settings.js` | Seed contact page settings |

---

## API Overview

All API routes live under `/api/`. Key endpoint groups:

| Group | Base Path | Auth |
|---|---|---|
| Auth | `/api/auth/*` | Public |
| User settings | `/api/user/settings/*` | User JWT |
| Tools | `/api/tools/*` | Public / User |
| Forms | `/api/forms/*` | User JWT |
| AI Analysis | `/api/analyze/*` | User JWT |
| Admin users | `/api/admin/users/*` | Admin JWT |
| Admin tools | `/api/admin/tools/*` | Admin JWT |
| Admin analytics | `/api/admin/analytics/*` | Admin JWT |
| Feedback | `/api/feedback/*` | Public |
| URL Shortener | `/api/url-shortener/*` | Public / User |

---

## Architecture Decisions

- **App Router over Pages Router** — Leverages React Server Components for layout performance and co-located API routes
- **Custom auth over NextAuth** — Full control over session shape, security questions, rate limiting, and dual-system admin auth
- **MongoDB over SQL** — Flexible schema suits varied tool data models; Atlas provides managed hosting with global replication
- **Zod for validation** — Runtime type safety at all API boundaries, consistent error shapes, and shared schemas between client/server
- **Static tool registry** — Tools defined in `src/data/tools.ts` as the single source of truth, synced to DB via seed script

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push and open a pull request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

```
MIT License

Copyright (c) 2026 AI Toolbox

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Acknowledgements

Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), [MongoDB](https://www.mongodb.com), and [OpenAI](https://openai.com).
