# RAG Chatbot (Next.js)

Multi-user RAG chatbot with **MongoDB**, **JWT session auth**, **Chroma Cloud**, and **Google Gemini**.

## Features

- Sign up / sign in with secure password hashing (bcrypt)
- HttpOnly session cookies (JWT)
- Per-user document uploads (isolated in Chroma via `user_id` metadata)
- Chat history stored in MongoDB
- Hybrid search (dense + sparse RRF) on your documents only

## Setup

```bash
npm install

copy .env.local.example .env.local
```

Edit `.env.local`:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `AUTH_SECRET` | Random string, min 32 chars |
| `GEMINI_API_KEY` | Google AI Studio key |
| `CHROMA_*` | Chroma Cloud credentials |

Start MongoDB locally (or use Atlas), then:

```bash
npm run dev
```

Open http://localhost:3000 → sign up → upload docs → chat.

## API routes

| Route | Auth | Description |
|-------|------|-------------|
| `POST /api/auth/signup` | Public | Create account |
| `POST /api/auth/signin` | Public | Sign in |
| `POST /api/auth/logout` | Session | Sign out |
| `GET /api/auth/me` | Session | Current user |
| `GET/POST /api/chats` | Session | List / create chats |
| `GET/DELETE /api/chats/[id]` | Session | Load / delete chat |
| `POST /api/chat` | Session | Send message (saves history) |
| `POST /api/documents/upload` | Session | Upload file |
| `POST /api/documents/text` | Session | Paste text |

## Security

- Passwords hashed with bcrypt (12 rounds)
- Sessions in **httpOnly** cookies (not accessible to JS)
- Middleware protects all pages and APIs except auth
- Chroma queries filtered by `user_id` — users only see their own chunks
- MongoDB queries scoped by `userId` on every chat/document

## Project structure

```
app/
  page.js              # Main app (protected)
  login/ signup/       # Auth pages
  api/                 # Route handlers
components/
lib/
  auth/                # Session, passwords
  db/                  # MongoDB models
  services/            # RAG, Chroma, chats
middleware.js          # Route protection
```
