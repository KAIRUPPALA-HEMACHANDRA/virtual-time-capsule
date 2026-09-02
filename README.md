# 🕰️ Virtual Time Capsule

**Preserve today. Unlock tomorrow.**

A full-stack web application that lets users store messages, images, voice recordings, and videos to be "opened" at a future date. Features scheduled delivery, end-to-end encryption, geo-locked capsules, collaborative group capsules, digital legacy mode, and more.

🔗 **Live Demo:** [https://virtual-time-capsule-ten.vercel.app](https://virtual-time-capsule-ten.vercel.app)

📄 **API Docs:** [https://virtual-time-capsule-iif2.onrender.com/api/docs](https://virtual-time-capsule-iif2.onrender.com/api/docs)

---

## 📸 Screenshots

### Landing Page
The first thing visitors see — a clean, modern landing page explaining the app's purpose with feature highlights and a clear call-to-action.

### Dashboard
Shows all your capsules with live countdown timers, status filters (Locked/Unlocked/Opened), search, and sort functionality.

### Create Capsule
Rich creation form with text message, file attachments, voice/video recording, geo-locking, capsule chains, encryption, recipients, anonymous mode, self-destruct, and digital legacy options.

### View Capsule (Locked)
Sealed capsule view showing countdown timer, "Content Sealed" message, and geo-unlock/chain status indicators.

### View Capsule (Opened)
Revealed content with attachments gallery, contributor messages, proof-of-creation certificate link, and share button.

### Shared Capsule Page
Public page accessible without login — shows the capsule content with emoji reactions. Perfect for sharing on WhatsApp, Instagram, or any messenger.

### Proof-of-Creation Certificate
Cryptographic verification page showing SHA-256 hash, timestamp, and algorithm — proves content existed at a specific time.

### Emotion Timeline
Interactive chart tracking sentiment across capsule messages over time using NLP analysis.

---

## ✨ Features

### Core Features
- **User Authentication** — JWT access + refresh tokens, bcrypt password hashing, HTTP-only cookies, token rotation
- **Capsule CRUD** — Create, read, update, and delete time capsules with future unlock dates
- **Scheduled Delivery** — Capsules auto-unlock at the exact scheduled time using pg-boss job queue backed by PostgreSQL
- **File Uploads** — Attach images, audio, video, and PDFs (up to 5 files, 10MB each) using Multer
- **Input Validation** — Zod schema validation on all inputs with detailed error messages
- **Rate Limiting** — Protection against brute-force attacks and API abuse

### Security Features
- **End-to-End Encryption** — AES-256-GCM encryption using Web Crypto API. Content encrypted in the browser before reaching the server. Server never sees plaintext.
- **Proof-of-Creation Certificates** — SHA-256 hash of content + timestamp. Cryptographically proves content existed at a specific time without revealing what it says.
- **Secure Authentication** — JWT with refresh token rotation, HTTP-only cookies, bcrypt with 12 salt rounds

### Unique Features
- **Geo-Locked Capsules** — Pin a capsule to a GPS location with configurable radius (50-1000m). Uses Haversine formula for distance calculation. Capsule only opens when the recipient is physically at the right location.
- **Capsule Chains** — Link capsules in a sequence where each one only unlocks after the previous is opened. Creates digital treasure hunts and scavenger hunts.
- **Digital Legacy Mode** — Capsules that deliver when the user has been inactive for a chosen period (30 days to 1 year). A "digital will" for messages to loved ones.
- **Emotion Timeline** — NLP-powered sentiment analysis on capsule messages. Visualizes emotional journey over time with an interactive Recharts chart.
- **Anonymous Mode** — Send capsules without revealing your identity. Recipients see "From someone special 🎭".
- **Self-Destruct** — Messages that disappear after being read once, like Snapchat.
- **Emoji Reactions** — Recipients can react to capsules with emojis. Sender gets notified.

### Social Features
- **Recipient System** — Add recipient emails. They get notified when the capsule unlocks.
- **Shareable Links** — Generate unique secret URLs. Anyone can view the capsule without an account — perfect for sharing on WhatsApp, Instagram, etc.
- **Collaborative Group Capsules** — Invite multiple people to contribute to a single capsule. All contributions are sealed until the unlock date.
- **Public Capsule Wall** — A community page showing opened public capsules.
- **Real-Time Notifications** — Socket.io powered instant notifications with bell icon and dropdown.

### User Experience
- **Voice & Video Recording** — Record voice memos and video messages directly in the browser using MediaRecorder API
- **Responsive Design** — Mobile-first with hamburger menu, works on all screen sizes
- **Search & Sort** — Filter capsules by title, sort by date, status, or alphabetically
- **Profile Page** — User stats, emotion timeline, password change
- **Email Notifications** — HTML email notifications via Nodemailer when capsules unlock
- **Interactive API Docs** — Swagger/OpenAPI documentation at `/api/docs`

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **PostgreSQL** | Primary database |
| **Prisma** | ORM with type-safe queries and migrations |
| **pg-boss** | PostgreSQL-backed job queue for scheduled delivery |
| **Socket.io** | Real-time WebSocket notifications |
| **JWT + bcrypt** | Authentication and password security |
| **Zod** | Input validation |
| **Nodemailer** | Email notifications via Gmail SMTP |
| **Multer** | File upload handling |
| **Swagger** | Interactive API documentation |
| **Jest + Supertest** | Testing (41 tests) |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library |
| **Vite** | Build tool and dev server |
| **React Router** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **Socket.io Client** | Real-time notifications |
| **Recharts** | Emotion timeline chart |
| **React Hot Toast** | Toast notifications |
| **Web Crypto API** | Client-side AES-256-GCM encryption |
| **MediaRecorder API** | Voice and video recording |

### Deployment
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting |
| **Render** | Backend hosting |
| **Supabase** | PostgreSQL database |

---

## 🏗️ Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   React + Vite   │────▶│  Express.js API   │────▶│   PostgreSQL     │
│   (Vercel)       │◀────│  (Render)         │◀────│   (Supabase)     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │
        │    WebSocket           │    pg-boss
        └────────────────────────┘    Job Queue
              Socket.io               (Scheduled Delivery)
```

### Backend Architecture
```
server/
├── prisma/
│   └── schema.prisma          # Database schema (12 migrations)
├── src/
│   ├── config/
│   │   ├── db.js              # Prisma client connection
│   │   ├── env.js             # Environment variable loader
│   │   ├── queue.js           # pg-boss job queue setup
│   │   ├── socket.js          # Socket.io initialization
│   │   └── swagger.js         # API documentation config
│   ├── controllers/           # HTTP request handlers
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── errorHandler.js    # Centralized error handling
│   │   ├── rateLimiter.js     # API rate limiting
│   │   ├── upload.js          # Multer file upload
│   │   ├── validate.js        # Zod validation middleware
│   │   ├── activityTracker.js # User activity for legacy mode
│   │   └── notFound.js        # 404 handler
│   ├── routes/                # URL endpoint definitions
│   ├── services/              # Business logic layer
│   ├── jobs/
│   │   ├── capsuleJobs.js     # Capsule unlock worker
│   │   └── legacyJobs.js      # Legacy mode daily checker
│   ├── utils/
│   │   ├── AppError.js        # Custom error class
│   │   ├── catchAsync.js      # Async error wrapper
│   │   ├── emailService.js    # Nodemailer email sender
│   │   ├── geoUtils.js        # Haversine distance formula
│   │   ├── hashUtils.js       # SHA-256 proof-of-creation
│   │   ├── sentimentUtils.js  # NLP sentiment analysis
│   │   ├── shareUtils.js      # Share token generator
│   │   ├── tokenUtils.js      # JWT token utilities
│   │   └── validators.js      # Zod schemas
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── tests/
│   ├── auth.test.js           # Authentication tests
│   ├── capsule.test.js        # Capsule CRUD tests
│   ├── utils.test.js          # Utility function tests
│   └── setup.js               # Test helpers
└── uploads/                   # Local file storage
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KAIRUPPALA-HEMACHANDRA/virtual-time-capsule.git
   cd virtual-time-capsule
   ```

2. **Set up the backend:**
   ```bash
   cd server
   npm install
   npm install @prisma/client@6 --save-exact
   npm install -D prisma@6 --save-exact
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/virtual_time_capsule?schema=public"
   DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/virtual_time_capsule?schema=public"
   ```

4. **Create the database:**
   ```bash
   psql -U postgres -c "CREATE DATABASE virtual_time_capsule;"
   ```

5. **Run migrations:**
   ```bash
   npx prisma@6 migrate dev
   npx prisma@6 generate
   ```

6. **Start the backend:**
   ```bash
   npm run dev
   ```

7. **Set up the frontend (new terminal):**
   ```bash
   cd client
   npm install
   npm run dev
   ```

8. **Open the app:**
   ```
   http://localhost:5173
   ```

### Email Setup (Optional)
To enable email notifications:
1. Create a Gmail account for the app
2. Enable 2-Step Verification
3. Generate an App Password at https://myaccount.google.com/apppasswords
4. Update `.env` with the credentials

---

## 🧪 Testing

Run the test suite (41 tests):
```bash
cd server
npm test
```

Tests cover:
- **Authentication** — Register, login, token validation, protected routes
- **Capsule CRUD** — Create, read, update, delete, validation
- **Geo Utils** — Haversine distance calculation, radius checking
- **Hash Utils** — SHA-256 generation and verification
- **Sentiment Utils** — Happy, sad, neutral, empty text analysis

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get profile |
| PATCH | `/api/auth/change-password` | Change password |

### Capsules
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/capsules` | Create capsule (multipart/form-data) |
| GET | `/api/capsules` | List user's capsules |
| GET | `/api/capsules/:id` | Get single capsule |
| PATCH | `/api/capsules/:id` | Update locked capsule |
| DELETE | `/api/capsules/:id` | Delete capsule |
| POST | `/api/capsules/:id/geo-check` | Check geo-unlock |

### Collaboration
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/collaborate/invite` | Invite contributors |
| POST | `/api/collaborate/:id/accept` | Accept invitation |
| POST | `/api/collaborate/:id/contribute` | Add contribution |
| GET | `/api/collaborate/:id/contributors` | List contributors |
| GET | `/api/collaborate/invitations` | Pending invitations |

### Public (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/capsules` | Public capsule wall |
| GET | `/api/verify/:id` | Proof-of-creation certificate |
| GET | `/api/shared/:token` | View shared capsule |
| POST | `/api/shared/:token/react` | React to capsule |

Full interactive docs at `/api/docs`

---

## 🗄️ Database Schema

12 database tables managed by Prisma:
- **Users** — Accounts with hashed passwords
- **Capsules** — Time capsules with 20+ configurable fields
- **Attachments** — File uploads linked to capsules
- **RefreshTokens** — JWT refresh token storage
- **Recipients** — Capsule delivery targets
- **Contributors** — Collaborative capsule participants
- **Notifications** — Real-time notification history

---

## 🔒 Security Measures

- **Password Hashing** — bcrypt with 12 salt rounds
- **JWT Token Rotation** — Short-lived access (15min) + long-lived refresh (7 days)
- **HTTP-Only Cookies** — Refresh tokens stored securely, inaccessible to JavaScript
- **Rate Limiting** — 100 req/15min general, 10 req/15min for auth routes
- **Input Validation** — Zod schemas on every endpoint
- **CORS** — Configured for specific frontend origin only
- **Helmet** — Security HTTP headers
- **E2E Encryption** — AES-256-GCM with PBKDF2 key derivation (100,000 iterations)

---

## 🌐 Deployment

### Frontend (Vercel)
- Auto-deploys from GitHub `main` branch
- SPA routing configured via `vercel.json`
- Environment: `VITE_API_URL` points to backend

### Backend (Render)
- Auto-deploys from GitHub `main` branch
- Build: `npm install && npx prisma@6 generate`
- Start: `npx prisma@6 migrate deploy && node src/server.js`
- 15 environment variables configured

### Database (Supabase)
- Free PostgreSQL instance
- Connection pooling via PgBouncer
- All migrations managed by Prisma

---

## 👨‍💻 Author

**Kairuppala Hemachandra**

- GitHub: [@KAIRUPPALA-HEMACHANDRA](https://github.com/KAIRUPPALA-HEMACHANDRA)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

