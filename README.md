# 🕰️ Virtual Time Capsule

A full-stack web application that lets users store messages, images, voice recordings, and videos to be "opened" at a future date. Features scheduled delivery, end-to-end encryption, collaborative group capsules, geo-locked capsules, and more.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Job Queue:** BullMQ + Redis
- **Real-time:** Socket.io
- **Authentication:** JWT + bcrypt
- **Encryption:** AES-256-GCM (Web Crypto API)

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- Redis (for job queue)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/virtual-time-capsule.git
   cd virtual-time-capsule
   ```

2. Set up the backend:
   ```bash
   cd server
   npm install
   cp .env.example .env    # Edit .env with your database credentials
   npx prisma migrate dev  # Create database tables
   npm run dev              # Start backend server
   ```

3. Set up the frontend:
   ```bash
   cd client
   npm install
   npm run dev              # Start frontend dev server
   ```

4. Open `http://localhost:5173` in your browser.

## Features

- ✅ User authentication (JWT + refresh tokens)
- ✅ Create, read, update, delete capsules
- ✅ Scheduled capsule delivery (BullMQ)
- ✅ Image, voice, and video attachments
- ✅ End-to-end encryption (AES-256-GCM)
- ✅ Collaborative group capsules
- ✅ Real-time notifications (Socket.io)
- ✅ Geo-locked capsules (GPS-based unlocking)
- ✅ Capsule chains (digital treasure hunts)
- ✅ Emotion timeline with sentiment analysis
- ✅ Digital legacy mode
- ✅ Public capsule wall
- ✅ Analytics dashboard

## License

MIT
