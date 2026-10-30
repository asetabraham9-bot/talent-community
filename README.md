# 🤝 Talent Community

> **Connecting Wolaita Talent with Real-World Challenges**

A full-stack web platform that bridges the gap between skilled individuals and organizations across Wolaita, South-Ethiopia. Talents discover and apply to real challenges; organizations attract capable people and manage the entire pipeline from challenge to delivered project.

[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?style=flat-square&logo=framer)](https://www.framer.com/motion/)

---

## Overview

**Talent Community** is designed to make practical opportunities accessible for Wolaitan talent. Organizations post real challenges; talented individuals apply, collaborate, and build their portfolio. Admins oversee the platform, verify organizations, and manage users.

### Problem It Solves

Talented individuals in Wolaita have limited visibility and few structured ways to showcase practical skills. At the same time, organizations struggle to discover capable people and present real problems to the right audience. Talent Community centralizes the full journey — from challenge discovery to project delivery — in one modern, accessible platform.

### Target Users

- **Talent** — Students and professionals looking for real challenges and portfolio opportunities
- **Organizations** — Businesses and institutions with real problems to solve
- **Admins** — Platform managers who verify organizations and oversee users

---

## Features

### Authentication & Roles

- JWT-based authentication (access token stored in `sessionStorage`)
- Three distinct roles: `talent`, `organization`, `admin`
- Role-based routing — each role lands on its own protected workspace
- Registration with role selection (talent or organization)
- Secure password hashing with Argon2

### Public Pages

- **Home** — Hero, live challenge feed, platform stats, call-to-action
- **Challenges** — Browse and filter all published challenges
- **Challenge Detail** — Full details with inline application form (cover message required)
- **Talents** — Public showcase of talent profiles (name, headline, skills, location)
- **About** — Platform mission and values
- **Contact** — Contact form
- **FAQs** — Frequently asked questions

### Talent Workspace

- **Dashboard** — Stats summary, recent applications, quick links
- **Profile** — Create and update headline, bio, skills, education, location, portfolio URL, social links, availability
- **Applications** — Track all submitted applications and their statuses (submitted → shortlisted → accepted / rejected / withdrawn)
- **Projects** — View projects the talent is contributing to (auto-populated from accepted applications)

### Organization Workspace

- **Dashboard** — Overview of challenges, applications, and project activity
- **Profile** — Manage organization name, description, industry, location, website, verification status
- **Challenges** — Create, edit, and manage challenge lifecycle (draft → published → paused / closed → archived)
- **Applications** — Review talent applications per challenge; shortlist, accept, or reject
- **Projects** — Create projects from challenges with accepted applicants; track status and deliverables

### Admin Workspace

- **Dashboard** — Platform-wide stats across users, challenges, and applications
- **Organizations** — Review and verify or reject organization registrations
- **Users** — Browse and manage all platform users

### User Experience

- Fully responsive design (Mobile / Tablet / Desktop)
- Smooth animations with **Framer Motion** and `prefers-reduced-motion` compliance
- Skeleton loading states for all data-heavy pages
- Inline error states with retry buttons
- Accessible forms with ARIA roles and labels

---

## Tech Stack

### Frontend

| Category         | Technology                      |
| ---------------- | ------------------------------- |
| Framework        | React 19 + Vite 6               |
| Routing          | React Router v7                 |
| Styling          | Tailwind CSS v4                 |
| Animations       | Framer Motion 11                |
| Icons            | Lucide React                    |
| HTTP             | Native `fetch` via `api.js`     |
| State            | React Context (AuthContext)     |

### Backend

| Category         | Technology                      |
| ---------------- | ------------------------------- |
| Runtime          | Node.js (ESM)                   |
| Framework        | Express 5                       |
| Database         | MongoDB Atlas via Mongoose 9    |
| Authentication   | JWT (`jsonwebtoken`)            |
| Password Hashing | Argon2                          |
| Environment      | dotenv                          |
| Dev Server       | nodemon                         |

---

## Project Structure

```
talent-community/
├── client/                     # React frontend (Vite)
│   ├── public/                 # Static assets
│   └── src/
│       ├── app/                # AppRouter.jsx — all route definitions
│       ├── assets/             # Images, SVG logos, brand guidelines
│       ├── components/
│       │   └── navigation/     # PublicHeader, PublicFooter, DashboardSidebar
│       ├── context/            # AuthContext — global auth state
│       ├── layouts/            # DashboardLayout
│       ├── pages/
│       │   ├── admin/          # AdminDashboard, Organizations, Users
│       │   ├── auth/           # Login, Register
│       │   ├── organization/   # Dashboard, Profile, Challenges, Applications, Projects
│       │   ├── public/         # Home, Challenges, ChallengeDetail, Talents, About, Contact, FAQs
│       │   └── talent/         # Dashboard, Profile, Applications, Projects
│       ├── routes/             # ProtectedRoute guard
│       └── services/           # api.js — central fetch wrapper
│
├── server/                     # Node.js/Express backend
│   ├── scripts/                # create-admin.js utility
│   └── src/
│       ├── config/             # db.js — MongoDB connection
│       ├── controllers/        # One controller per resource
│       ├── middleware/         # auth, error, notFound
│       ├── models/             # Mongoose schemas
│       ├── repositories/       # DB query layer (one per model)
│       ├── routes/             # Express routers + index.routes.js
│       ├── services/           # Business logic layer
│       ├── utils/              # password.util.js
│       └── validators/         # Input validation
│
└── docs/                       # SRS and architecture documents
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint           | Access | Description               |
| ------ | ------------------ | ------ | ------------------------- |
| POST   | `/auth/register`   | Public | Register a new account    |
| POST   | `/auth/login`      | Public | Log in and receive a JWT  |

### Talent Profiles

| Method | Endpoint              | Access | Description                        |
| ------ | --------------------- | ------ | ---------------------------------- |
| GET    | `/talent-profiles`    | Public | Browse all public talent profiles  |
| GET    | `/talent/profile`     | Talent | Get own profile                    |
| POST   | `/talent/profile`     | Talent | Create own profile                 |
| PATCH  | `/talent/profile`     | Talent | Update own profile                 |

### Organization Profiles

| Method | Endpoint                    | Access       | Description        |
| ------ | --------------------------- | ------------ | ------------------ |
| GET    | `/organization/profile`     | Organization | Get own profile    |
| POST   | `/organization/profile`     | Organization | Create own profile |
| PATCH  | `/organization/profile`     | Organization | Update own profile |

### Challenges

| Method | Endpoint                   | Access       | Description                        |
| ------ | -------------------------- | ------------ | ---------------------------------- |
| GET    | `/challenges`              | Public       | Browse published challenges        |
| GET    | `/challenges/:id`          | Public       | Get one challenge detail           |
| POST   | `/challenges`              | Organization | Create a challenge draft           |
| GET    | `/challenges/my`           | Organization | Get own organization's challenges  |
| PATCH  | `/challenges/:id`          | Organization | Update a challenge                 |
| PATCH  | `/challenges/:id/status`   | Organization | Change challenge lifecycle status  |

### Applications

| Method | Endpoint                         | Access       | Description                       |
| ------ | -------------------------------- | ------------ | --------------------------------- |
| POST   | `/applications`                  | Talent       | Submit an application             |
| GET    | `/applications/my`               | Talent       | Get own applications              |
| GET    | `/applications/challenge/:id`    | Organization | Get applications for a challenge  |
| PATCH  | `/applications/:id/status`       | Organization | Review (shortlist/accept/reject)  |
| PATCH  | `/applications/:id/withdraw`     | Talent       | Withdraw an application           |
| GET    | `/applications/:id`              | Talent/Org   | Get a single application          |

### Projects

| Method | Endpoint                                | Access       | Description                             |
| ------ | --------------------------------------- | ------------ | --------------------------------------- |
| POST   | `/projects`                             | Organization | Create project from a challenge         |
| GET    | `/projects/my`                          | Organization | Get own organization's projects         |
| GET    | `/projects/by-challenge/:challengeId`   | Talent       | Get project by challenge (contributor)  |
| GET    | `/projects/:id`                         | Talent/Org   | Get a project by ID                     |
| PATCH  | `/projects/:id`                         | Organization | Update project details                  |
| PATCH  | `/projects/:id/status`                  | Organization | Change project lifecycle status         |

### Admin

| Method | Endpoint                             | Access | Description                 |
| ------ | ------------------------------------ | ------ | --------------------------- |
| GET    | `/admin/stats`                       | Admin  | Platform-wide statistics    |
| GET    | `/admin/users`                       | Admin  | List all users              |
| GET    | `/admin/organizations`               | Admin  | List all organizations      |
| PATCH  | `/admin/organizations/:id/verify`    | Admin  | Verify an organization      |
| PATCH  | `/admin/organizations/:id/reject`    | Admin  | Reject an organization      |

---

## 🚀 Deployment

### Live Demo

The platform is deployed on Render:

- **Frontend:** `https://talent-community-client.onrender.com`
- **Backend API:** `https://talent-community-api.onrender.com`
- **Health Check:** `https://talent-community-api.onrender.com/api/health`

### Deploy Your Own

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for quick deployment instructions, or the complete **[Render Deployment Guide](./docs/RENDER_DEPLOYMENT_GUIDE.md)** for detailed steps.

**Quick Deploy:**
1. Fork this repository
2. Sign up at [render.com](https://render.com)
3. Connect your repo and deploy via Blueprint (detects `render.yaml`)
4. Configure MongoDB URI in environment variables
5. Done! ✅

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- A **MongoDB Atlas** cluster (free tier works)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/asetabraham9-bot/talent-community.git
cd talent-community
```

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure Environment Variables

#### Server — `server/.env`

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_random_secret_min_32_chars
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

#### Client — `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Create an Admin Account

Use the provided script to seed the first admin user:

```bash
cd server
node scripts/create-admin.js
```

### 5. Run the Development Servers

Open two terminals.

**Terminal 1 — Backend:**

```bash
cd server
npm run dev
```

The API will be available at `http://localhost:5000`.

**Terminal 2 — Frontend:**

```bash
cd client
npm run dev
```

Open your browser and visit:

```
http://localhost:5173
```

---

## Brand & Design System

### Color Palette

| Color              | Hex        | Purpose                             |
| ------------------ | ---------- | ----------------------------------- |
| **Navy**           | `#102c46`  | Primary brand, hero backgrounds     |
| **Teal**           | `#0d9488`  | Accent, CTAs, active states         |
| **Slate** (scale)  | Tailwind   | Text, borders, surface backgrounds  |

### Typography

| Type      | Font                            |
| --------- | ------------------------------- |
| UI / Body | System sans-serif via Tailwind  |
| Code      | System monospace                |

## Data Models

| Model                  | Key Fields                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `User`                 | `fullName`, `email`, `passwordHash`, `role` (talent/organization/admin), `status`      |
| `TalentProfile`        | `user`, `headline`, `bio`, `skills[]`, `location`, `availability`, `visibility`        |
| `OrganizationProfile`  | `user`, `name`, `description`, `industry`, `verificationStatus`, `location`            |
| `Challenge`            | `title`, `description`, `category`, `status`, `deadline`, `organization`, `requiredSkills[]` |
| `Application`          | `challenge`, `talent`, `coverMessage`, `relevantSkills[]`, `status`, `reviewNotes`     |
| `Project`              | `title`, `challenge`, `organization`, `contributors[]`, `status`, `startDate`          |
| `AuditLog`             | `actor`, `action`, `resource`, `resourceId`, `timestamp`                               |

---

## Challenge Lifecycle

```
draft → published → paused → closed → archived
              ↑________↑
```

Only verified organizations can publish. Unverified organizations can create and save drafts but cannot make them visible to the public.

## Application Lifecycle

```
submitted → shortlisted → accepted
          ↘              ↘
           rejected        rejected

talent can withdraw at: submitted or shortlisted
```

---

## Security

- Passwords hashed with **Argon2** (winner of the Password Hashing Competition)
- JWT signed with a configurable secret, 1-day expiry by default
- Tokens stored in `sessionStorage` (cleared on tab close)
- Route-level authorization middleware — role mismatches return 403
- MongoDB ObjectId validation before every DB query to prevent cast errors
- CORS enabled for the configured `CLIENT_URL` origin

---

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork this repository.
2. Create your feature branch.

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes.

```bash
git commit -m "feat: describe your change"
```

4. Push to your branch.

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request.

---

## Author

**Asayehu Abraham** — [asetabraham9@gmail.com.com](mailto:asetabraham9@gmail.com)

---

## License

This project is licensed under the **MIT License** — free to use for educational, learning, and portfolio purposes.

---

<div align="center">

Made by Asayehu Abraham for Wolaita talent and organizations

[⬆ Back to Top](#-talent-community)

</div>
