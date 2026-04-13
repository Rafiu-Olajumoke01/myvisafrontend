# MyVisa App 🌍
### International Visa Processing Platform — Full-Stack Solo Build

<div align="center">

![Status](https://img.shields.io/badge/Status-Launching%20Soon-f59e0b?style=for-the-badge)
![Built By](https://img.shields.io/badge/Built%20By-Solo-6366f1?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=nextdotjs)
![Backend](https://img.shields.io/badge/Backend-Django-092E20?style=for-the-badge&logo=django)
![WebSocket](https://img.shields.io/badge/Real--Time-WebSocket-22c55e?style=for-the-badge)

</div>

---

## What Is MyVisa?

MyVisa is an **end-to-end international visa processing platform** for student, tourist, and business visa applications.

Think of it like **Uber — but for visa agents.**

A user opens the app, taps a button, and gets **instantly connected to a live visa agent** via an in-app call. The agent guides them through the entire application process in real time — no confusion, no paperwork black holes, no waiting weeks without answers.

I built **everything** — frontend, backend, database, real-time communication, APIs, and deployment — **completely alone**, from the first line of code to production.

---

## The Problem

Navigating international visa applications is slow, confusing, and disconnected from real human support.

- Applicants don't know what documents to submit
- Processing portals are complex and overwhelming
- There is no real-time human guidance available
- Agents are hard to reach and communication is fragmented
- Mistakes cost money and cause serious delays

---

## The Solution

MyVisa connects applicants directly to live visa agents in real time — the same way Uber connects a rider to a driver.

- Tap a button → get connected to an available agent instantly
- Agent guides you through the full application via live in-app call
- Upload documents, track progress, and communicate — all in one place
- Covers **Student**, **Tourist**, and **Business** visa categories
- Mobile app currently in final development by a dedicated mobile team

---

## What I Built — Solo

> Every line of this codebase was written by me. No team. No co-founder. Just me, the problem, and the keyboard.

| Area | What I Did |
|---|---|
| **Frontend** | Built the entire UI with Next.js — every screen, every component, every state |
| **Backend** | Designed and built the full Django REST API from scratch |
| **Database** | Designed the schema, managed migrations, handled all data architecture |
| **WebSockets** | Implemented Django Channels for real-time agent-user communication |
| **Live Calling** | Built Uber-style live agent connection and in-app calling system |
| **REST APIs** | Designed and documented all API endpoints end to end |
| **DevOps** | Handled deployment, environment configuration, and server setup solo |
| **Mobile** | Coordinated with mobile team; web platform fully production-ready |

---

## Tech Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

### Backend
![Django](https://img.shields.io/badge/Django-092E20?style=flat-square&logo=django&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Django REST](https://img.shields.io/badge/Django_REST_Framework-ff1709?style=flat-square&logo=django&logoColor=white)
![Django Channels](https://img.shields.io/badge/Django_Channels-WebSocket-22c55e?style=flat-square)

### Database & Real-Time
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-6366f1?style=flat-square)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)

### Tools & Deployment
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white)

---

## Key Features

```
✓  Uber-style live agent matching
✓  Real-time in-app calling
✓  End-to-end visa application flow
✓  Student · Tourist · Business visa categories
✓  Django Channels WebSocket messaging
✓  Document upload and management
✓  Agent and applicant dashboards
✓  REST API — fully designed and documented
✓  Mobile app in final development
✓  Full deployment & DevOps handled solo
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   CLIENT                         │
│           Next.js · React · CSS                  │
└──────────────────────┬──────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────┐
│                  BACKEND                         │
│         Django · Django REST Framework           │
│         Django Channels · WebSocket              │
└──────────┬───────────────────────────┬──────────┘
           │                           │
┌──────────▼──────────┐   ┌────────────▼──────────┐
│      DATABASE        │   │     REAL-TIME LAYER    │
│        MySQL         │   │    Redis · Channels    │
└─────────────────────┘   └───────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MySQL
- Redis

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/Rafiu-Olajumoke01/myvisa-app.git

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

---

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Backend (.env)
```env
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_URL=mysql://user:password@localhost:3306/myvisa
REDIS_URL=redis://localhost:6379
```

---

## Challenges I Solved

**1. Real-time agent matching**
Implementing an Uber-style matching system where users are instantly paired with available agents required careful WebSocket state management with Django Channels and Redis as the channel layer.

**2. WebSocket + REST hybrid architecture**
Designing a system where real-time communication (Django Channels) and standard API calls (Django REST Framework) coexist cleanly without conflicts took significant architectural thinking.

**3. Full-stack solo execution**
Managing both the frontend and backend simultaneously — making design decisions, debugging cross-stack issues, and shipping features end to end — as a single developer required strong discipline and system thinking.

---

## Project Status

| Component | Status |
|---|---|
| Frontend (Next.js) | ✅ Complete |
| Backend (Django + APIs) | ✅ Complete |
| WebSocket / Real-time | ✅ Complete |
| Database | ✅ Complete |
| Deployment | ✅ Complete |
| Mobile App | 🔄 In Development (mobile team) |
| Live Launch | 🚀 Imminent |

---

## Developer

**Rafiu Olajumoke** — Full-Stack Developer, Heavy on Frontend

Built this entire platform solo. Every screen, every API endpoint, every database table, every WebSocket connection — from `npx create-next-app` to production deployment.

[![GitHub](https://img.shields.io/badge/GitHub-Rafiu--Olajumoke01-181717?style=flat-square&logo=github)](https://github.com/Rafiu-Olajumoke01)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Rafiu%20Olajumoke-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/rafiu-olajumoke-084374318)
[![Email](https://img.shields.io/badge/Email-rafiuolajumoke7%40gmail.com-EA4335?style=flat-square&logo=gmail)](mailto:rafiuolajumoke7@gmail.com)
[![Portfolio](https://img.shields.io/badge/Portfolio-View%20Live-6366f1?style=flat-square)](https://github.com/Rafiu-Olajumoke01)

---

<div align="center">

**Built with focus, discipline, and zero shortcuts.**

*From first commit to production — solo.*

</div>
