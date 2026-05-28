# 🌌 Spectr - Premium Privacy-First Analytics

![Spectr Banner](public/preview.png)

> **The next generation of web analytics.** Beautiful, high-performance, and deeply respectful of user privacy.

Spectr is a high-end analytics platform designed for developers who value both **aesthetic excellence** and **data integrity**. With a stunning dark-themed dashboard inspired by modern design trends, Spectr provides real-time insights without the overhead or privacy concerns of traditional trackers.

---

## ✨ Features that Define Excellence

### 🌑 Premium Dark Interface
A state-of-the-art dashboard built with **Aceternity UI** principles. Featuring glassmorphism, smooth animations, and a curated color palette that feels professional and refined.

### ⚡ Real-Time Intelligence
Watch your traffic as it happens. Our **SSE-powered Live Feed** gives you instantaneous feedback on every visitor, interaction, and event without ever refreshing the page.

### 🛡️ Privacy by Design
- **No Cookies Required**: Track users without intruding on their privacy.
- **GDPR & CCPA Compliant**: Built from the ground up to respect global privacy standards.
- **Zero Fingerprinting**: We focus on high-level traffic patterns, not individual tracking.

### 🛠️ One-Line Integration
Integrate Spectr into any project in seconds. Simply drop our minimal script tag into your `<head>` and start collecting insights immediately.

---

## 🚀 Technical Architecture

Spectr is built on a modern, robust stack designed for scalability and speed:

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Hosted on Neon)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/) (Google & Twitter providers)

---

## 🛠️ Quick Start Guide

### 1. Installation
```bash
git clone https://github.com/subhash-jhaa/WebGhost.git
cd spectr
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="your-postgresql-url"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000" # Use https://spectr.subhashjha.me in production

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="your-upstash-redis-rest-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-rest-token"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Use https://spectr.subhashjha.me in production
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
TWITTER_CLIENT_ID="your-twitter-id"
TWITTER_CLIENT_SECRET="your-twitter-secret"
```

### 3. Database Initialization
```bash
npx prisma generate
npx prisma db push
```

---

## 📊 The Dashboard Experience

The Spectr dashboard is divided into three core pillars:

1. **Overview**: A high-level view of your 7-day traffic trends, country distributions, and top referrers.
2. **Live Feed**: A dynamic, real-time stream of incoming visitors, showing their location, page visits, and entry points.
3. **Project Management**: Effortlessly create tracking keys for multiple domains and manage your analytics assets.

---

## 🔌 API Ecosystem

Spectr provides a clean, documented API for custom integrations:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/track` | `POST` | Ingest visitor telemetry |
| `/api/project` | `GET` | List all tracked domains |
| `/api/realtime` | `GET` | SSE stream for live visitor data |
| `/api/stats/[id]` | `GET` | Aggregated historical analytics |

---

## 🔒 Privacy Commitment

Spectr is designed with strict respect for user privacy:
- **No Persistent Tracking**: We do not use browser cookies or persistent browser storage (like `localStorage`) to track visitors across sessions.
- **Tab-Scoped Sessions**: We use ephemeral `sessionStorage` to isolate session-based telemetry to a single active browser tab. All session identifiers are immediately destroyed when the visitor closes their tab or browser window.
- **No PII Storage**: We utilize server-side IP detection to resolve geo-location insights (country and city), but we never store full IP addresses or any personally identifiable information (PII).

---

## 📄 License & Support

Software provided under the **MIT License**.

Built with ❤️ by **subhash-jhaa**. For support, please open an issue in the repository or join our community discussions.

---

**Ready to see who's viewing you?** [Get Started with Spectr](https://spectr.subhashjha.me/auth)
