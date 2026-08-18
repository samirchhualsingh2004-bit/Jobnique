# 🚀 Jobnique – AI Integrated Job Portal

An AI-powered full-stack job portal built with React, Node.js/Express, and MySQL that connects job seekers and employers with an intelligent recruitment experience.

## 🌐 Live Demo

- **Frontend:** https://jobnique.vercel.app
- **Backend API:** https://jobnique.onrender.com

---

# 📖 Overview

Jobnique is a modern recruitment platform where employers can post jobs, manage applications, and hire candidates, while job seekers can discover jobs, apply online, and manage their applications.

The platform also integrates AI-powered features to enhance the recruitment experience.

---

# ✨ Features

## 👨‍💼 Job Seeker

- User Authentication (JWT)
- Register & Login
- Google Authentication (planned)
- Search Jobs
- Apply for Jobs
- Upload Resume
- View Applied Jobs
- Update Profile
- AI Assistance

## 🏢 Employer

- Employer Authentication
- Post New Jobs
- Edit/Delete Jobs
- View Applicants
- Manage Job Listings
- Employer Dashboard

## 🤖 AI Features

- AI-powered Job Assistance
- Resume Analysis
- Smart Career Guidance
- AI Chat Support
- Intelligent Recommendations

---

# 🛠 Tech Stack

### Frontend
- React.js + Vite
- Redux Toolkit
- Axios
- React Router
- Tailwind CSS

### Backend
- Node.js + Express.js
- MySQL
- Sequelize ORM
- JWT Authentication
- Cloudinary
- Express File Upload

### AI
- OpenAI API / Gemini API (Configurable)

### Deployment
- Vercel (frontend)
- Render (backend)
- Render MySQL / PlanetScale / Railway (database)

---

# 📂 Project Structure

```
Jobnique/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── config.js
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── migrations/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
└── README.md
```

---

# ⚙️ Installation

## Prerequisites

- Node.js (v18+)
- MySQL Server (local or hosted)

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/jobnique.git
cd jobnique
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a MySQL database:

```sql
CREATE DATABASE jobnique;
```

Create `.env` (see `.env.example`):

```env
PORT=4000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=jobnique
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET_KEY=your_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

FRONTEND_URL=http://localhost:5173

# Resumes are stored locally in backend/uploads/resumes — no Cloudinary needed.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Required for AI features — get a free key at https://console.groq.com
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
```

### Only one token is required to run everything: `GROQ_API_KEY`

- Resume storage uses **local disk storage** (`backend/uploads/resumes`), not Cloudinary — so those Cloudinary fields can stay blank.
- Google OAuth is not wired up yet, so `VITE_GOOGLE_CLIENT_ID` isn't needed either.
- Get a free Groq key at [console.groq.com](https://console.groq.com) → API Keys → Create Key, then paste it into `GROQ_API_KEY`.

Run migrations to create tables:

```bash
npx sequelize-cli db:migrate
```

Run backend:

```bash
npm run dev
```

> Note: `server.js` also calls `sequelize.sync()` automatically in development, so tables will be created even without running migrations manually. Migrations are the recommended path for production.

---

## Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` (see `.env.example`):

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Run frontend:

```bash
npm run dev
```

Visit `http://localhost:5173`.

---

# 🗄 Database Schema

**users** — id, name, email, password, googleId, phone, role (`Job Seeker` / `Employer`), resumeUrl, resumePublicId

**jobs** — id, title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo, expired, postedBy (FK → users)

**applications** — id, jobId (FK → jobs), applicantId (FK → users), resumeUrl, coverLetter, status (`Pending` / `Reviewed` / `Accepted` / `Rejected`)

---

# 🔌 API Endpoints

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Jobs
- `GET /api/v1/jobs`
- `GET /api/v1/jobs/:id`
- `GET /api/v1/jobs/employer/my-jobs` *(Employer)*
- `POST /api/v1/jobs` *(Employer)*
- `PUT /api/v1/jobs/:id` *(Employer)*
- `DELETE /api/v1/jobs/:id` *(Employer)*

### Applications
- `POST /api/v1/applications/:jobId/apply` *(Job Seeker)*
- `GET /api/v1/applications/my-applications` *(Job Seeker)*
- `GET /api/v1/applications/job/:jobId` *(Employer)*
- `PUT /api/v1/applications/:id/status` *(Employer)*

### Profile & Resume
- `PUT /api/v1/auth/profile` — update name/phone
- `POST /api/v1/auth/upload-resume` — multipart upload, PDF or TXT, stored in `backend/uploads/resumes`, text auto-extracted for AI features

### AI (powered by Groq)
- `POST /api/v1/ai/chat` — general career/platform assistant chat
- `POST /api/v1/ai/analyze-resume` — structured feedback on the logged-in user's uploaded resume
- `POST /api/v1/ai/recommend-jobs` — top 5 open jobs matched against the user's resume, with reasons

---

# 🚀 Production Deployment

### Frontend
Deploy on Vercel.

### Backend
Deploy on Render.

### Database
Render MySQL / PlanetScale / Railway. Run `npx sequelize-cli db:migrate` as a build/release step.

---

# 🔒 Authentication

- JWT Authentication
- HTTP Only Cookies
- Protected Routes
- Google OAuth Login (planned)

---

# Future Improvements

- Resume Parsing
- Interview Preparation
- Job Recommendation Engine
- Resume Builder
- Email Notifications
- Chat between Employer & Candidate
- Admin Dashboard

---

# 🤝 Contributing

Contributions are welcome.

1. Fork Repository
2. Create Branch
   ```bash
   git checkout -b feature-name
   ```
3. Commit
   ```bash
   git commit -m "Added new feature"
   ```
4. Push
   ```bash
   git push origin feature-name
   ```
5. Create Pull Request

---
# Creators

- Samir Chhualsingh
- Pritam Panda
- Sanddep Behera

# ⭐ Support

If you like this project:

⭐ Star the repository

🍴 Fork it

📢 Share it with others

---

# 📄 License

This project is licensed under the MIT License.
