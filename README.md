# 🔍 GitHub Code Analyzer

## 📖 Overview

GitHub Code Analyzer is a full-stack application that lets you **index any public GitHub repository** and interact with its codebase through an intelligent, AI-powered conversational interface. It leverages **Retrieval-Augmented Generation (RAG)** with Google's Gemini AI and the Pinecone vector database to enable deep code querying, instant README generation, and file-specific explanations — all from a sleek, modern dashboard.

> 🚀 Paste a GitHub repo URL → the system clones, chunks, and embeds the code → then ask anything about it.

---

## 🌐 Live Demo

| Service  | URL                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------- |
| Frontend | [github-analyzer.vercel.app](https://github-analyzer.vercel.app)                                     |
| Backend  | [github-analyzer-f6do.onrender.com](https://github-analyzer-f6do.onrender.com)                       |
| Health   | [/health](https://github-analyzer-f6do.onrender.com/health)                                          |

---

## 🛠️ Tech Stack

### ⚙️ Backend
| Technology                  | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| **Node.js** + **Express**   | Runtime & API framework                    |
| **TypeScript**              | Type-safe development                      |
| **Google Gemini AI**        | Embeddings generation & LLM responses      |
| **Pinecone**                | Vector database for semantic search        |
| **MongoDB Atlas**           | Persistent storage for repos & file trees  |
| **LangChain Splitters**     | Intelligent code chunking                  |
| **simple-git**              | Git clone operations                       |
| **Zod**                     | Request validation                         |
| **Pino**                    | Structured logging                         |
| **Vitest**                  | Unit & integration testing                 |

### 🎨 Frontend
| Technology                  | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| **React 19**                | UI library                                 |
| **Vite**                    | Build tool & dev server                    |
| **TypeScript**              | Type-safe development                      |
| **Tailwind CSS**            | Utility-first styling                      |
| **Framer Motion**           | Animations & transitions                   |
| **React Router**            | Client-side routing                        |
| **Axios**                   | HTTP client for API calls                  |
| **React Syntax Highlighter**| Code block rendering                       |
| **React Icons**             | Icon library                               |
| **tsParticles**             | Animated particle backgrounds              |

---

## 🏗️ Architecture

### 📥 Ingestion Pipeline

```text
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  GitHub Repo URL │────▶│  Clone via Git   │────▶│  Read & Filter   │
│  (User Input)    │     │  (simple-git)    │     │  Source Files     │
└─────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                           │
                        ┌──────────────────┐     ┌────────▼─────────┐
                        │  Generate Vector │◀────│  Chunk Code      │
                        │  Embeddings      │     │  (LangChain)     │
                        │  (Gemini AI)     │     └──────────────────┘
                        └────────┬─────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │  Upsert Vectors to Pinecone         │
              │  (namespaced by repo)                │
              └──────────────────┬──────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │  Save Metadata to MongoDB Atlas     │
              │  (repo URL, file tree, timestamps)   │
              └─────────────────────────────────────┘
```

1. User submits a public GitHub repo URL
2. Backend clones the repository into a temporary directory via `simple-git`
3. Source files are read, filtered, and a file tree is constructed
4. Code files are split into semantic chunks using LangChain text splitters
5. Each chunk is embedded into a 768-dimensional vector via Gemini AI
6. Vectors are upserted into Pinecone under a repo-specific namespace
7. Repository metadata and file tree are persisted to MongoDB Atlas
8. Temporary clone directory is cleaned up

### 🤖 RAG Query Pipeline

```text
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  User Question   │────▶│  Embed Query     │────▶│  Semantic Search │
│  (Natural Lang)  │     │  (Gemini AI)     │     │  (Pinecone)      │
└──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                           │
                                                  Top-K relevant chunks
                                                           │
                        ┌──────────────────┐     ┌────────▼─────────┐
                        │  Formatted       │◀────│  LLM Generation  │
                        │  Response        │     │  (Gemini 2.0)    │
                        └──────────────────┘     └──────────────────┘
```

1. User's natural language question is embedded into a vector via Gemini
2. Pinecone performs a similarity search against the repo's namespace
3. Top-K most relevant code chunks are retrieved as context
4. Context + question are sent to Gemini LLM for answer generation
5. The formatted, context-aware response is returned to the user

---

## 🏁 Getting Started

### 📋 Prerequisites

- [Node.js](https://nodejs.org/) v20+ recommended
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account & cluster
- [Pinecone](https://pinecone.io/) account & index
- [Google Gemini API Key](https://aistudio.google.com/)
- [GitHub Personal Access Token](https://github.com/settings/tokens) *(optional but recommended to avoid rate-limiting)*

### ⚙️ Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/Varshad-Potle/github-analyzer.git
cd github-analyzer/Backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Fill in your API keys (see Environment Variables section below)

# 4. Start the development server
npm run dev
```

The backend server will start on `http://localhost:3000` by default.

### 🎨 Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd github-analyzer/frontend

# 2. Install dependencies
npm install

# 3. Create environment file
echo "VITE_API_URL=http://localhost:3000" > .env.local

# 4. Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173` by default.

### 🔑 Environment Variables

#### Backend (`Backend/.env`)

| Variable             | Description                            | Required |
| -------------------- | -------------------------------------- | -------- |
| `GEMINI_API_KEY`     | Google Gemini API key                  | ✅        |
| `PINECONE_API_KEY`   | Pinecone vector database API key       | ✅        |
| `PINECONE_INDEX_NAME`| Name of the Pinecone index             | ✅        |
| `MONGODB_URI`        | MongoDB Atlas connection string        | ✅        |
| `GITHUB_TOKEN`       | GitHub Personal Access Token           | ⚠️ Recommended |
| `GEMINI_MODEL`       | Gemini model to use (default: `gemini-2.0-flash`) | ❌ |
| `PORT`               | Server port (default: `3000`)          | ❌        |

#### Frontend (`frontend/.env.local`)

| Variable        | Description                              | Required |
| --------------- | ---------------------------------------- | -------- |
| `VITE_API_URL`  | Backend API base URL                     | ✅        |

---

## 📚 API Reference

### 📥 POST `/api/repos/index`

Ingest and index a public GitHub repository into the vector database.

```json
// Request Body
{
  "repoUrl": "https://github.com/user/repo"
}

// Response — 200 OK
{
  "message": "Repository indexed successfully",
  "repoUrl": "https://github.com/user/repo",
  "filesIndexed": 42,
  "chunksIndexed": 156
}
```

### 💬 POST `/api/chat/query`

Query the indexed codebase using natural language via RAG.

```json
// Request Body
{
  "question": "What does the auth middleware do?",
  "repoUrl": "https://github.com/user/repo",
  "topK": 5          // optional, 1–12, default varies
}

// Response — 200 OK
{
  "answer": "The auth middleware validates JWT tokens..."
}
```

### 📝 POST `/api/chat/generate-readme`

Generate a comprehensive README for an indexed repository based on analyzed code context.

```json
// Request Body
{
  "repoUrl": "https://github.com/user/repo"
}

// Response — 200 OK
{
  "readme": "# Project Name\n\n## Overview\n..."
}
```

### 💡 POST `/api/chat/explain`

Get an AI-generated explanation for a specific file within an indexed repository.

```json
// Request Body
{
  "filePath": "src/utils/auth.ts",
  "repoUrl": "https://github.com/user/repo"
}

// Response — 200 OK
{
  "explanation": "This file implements authentication utilities..."
}
```

### 📂 GET `/api/files`

Retrieve the file tree structure of an indexed repository.

```
GET /api/files?repoUrl=https://github.com/user/repo
```

```json
// Response — 200 OK
{
  "files": [
    { "filePath": "src/index.ts", "language": "typescript" },
    { "filePath": "src/utils/helpers.ts", "language": "typescript" }
  ]
}
```

### 📄 GET `/api/files/content`

Fetch the raw content of a specific file directly from GitHub.

```
GET /api/files/content?repoUrl=https://github.com/user/repo&filePath=src/utils/auth.ts
```

```json
// Response — 200 OK
{
  "filePath": "src/utils/auth.ts",
  "language": "typescript",
  "content": "import jwt from 'jsonwebtoken';\n..."
}
```

### ❤️ GET `/health`

Health check endpoint returning server status, uptime, and timestamp.

```json
// Response — 200 OK
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2026-03-13T17:48:46.000Z"
}
```

---

## 🗂️ Project Structure

```text
github-analyzer/
├── Backend/
│   ├── src/
│   │   ├── config/          # 🔧 Environment variables & API client configs
│   │   ├── middleware/      # 🛡️ Express middlewares (error handling, CORS)
│   │   ├── routes/          # 🛣️ API route definitions (repos, chat, files)
│   │   ├── services/        # ⚙️ Core business logic
│   │   │   ├── chunker.ts       # Code chunking with LangChain
│   │   │   ├── database.ts      # MongoDB Atlas operations
│   │   │   ├── embeddings.ts    # Gemini embedding generation
│   │   │   ├── git.ts           # Git clone & file reading
│   │   │   ├── ingestion.ts     # Orchestrates the full ingestion pipeline
│   │   │   ├── rag.ts           # RAG query, readme gen, file explain
│   │   │   └── vectorStore.ts   # Pinecone vector operations
│   │   ├── types/           # 📝 TypeScript interfaces & type definitions
│   │   ├── utils/           # 🔨 Shared helper utilities
│   │   ├── app.ts           # 🚀 Express app initialization
│   │   └── server.ts        # 🏁 HTTP server entry point
│   ├── tests/               # 🧪 Vitest test modules
│   ├── .env.example         # 📋 Environment variable template
│   ├── tsconfig.json        # ⚙️ TypeScript configuration
│   └── package.json         # 📦 Dependencies & scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/         # 🏠 Landing page components
│   │   │   │   ├── Hero.tsx         # Hero section with repo input
│   │   │   │   ├── StepsSection.tsx # How-it-works steps
│   │   │   │   ├── PrevRepos.tsx    # Previously indexed repos
│   │   │   │   ├── TeamSection.tsx  # Team showcase carousel
│   │   │   │   ├── ParticlesBg.tsx  # Animated particle background
│   │   │   │   └── Footer.tsx       # Site footer
│   │   │   ├── dashboard/       # 📊 Dashboard components
│   │   │   │   ├── ChatPanel.tsx    # AI chat interface
│   │   │   │   ├── CodeViewer.tsx   # Syntax-highlighted code viewer
│   │   │   │   ├── FileTree.tsx     # Repository file explorer
│   │   │   │   ├── MessageContent.tsx # Chat message renderer
│   │   │   │   └── Navbar.tsx       # Dashboard navigation bar
│   │   │   └── ui/              # 🎨 Shared UI components
│   │   ├── lib/
│   │   │   └── api.ts           # 🔌 Axios API client configuration
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx  # 🏠 Main landing page
│   │   │   ├── LoadingPage.tsx  # ⏳ Indexing progress page
│   │   │   └── DashboardPage.tsx# 📊 Code analysis dashboard
│   │   ├── App.tsx              # 🗺️ Route definitions
│   │   └── main.tsx             # 🏁 React entry point
│   ├── tailwind.config.js       # 🎨 Tailwind CSS configuration
│   ├── vite.config.ts           # ⚡ Vite build configuration
│   └── package.json             # 📦 Dependencies & scripts
│
└── README.md                    # 📖 This file
```

---

## 🧪 Running Tests

```bash
# Navigate to the backend directory
cd Backend

# Run the full test suite
npm run test

# Run tests in watch mode during development
npm run test:watch
```

Tests are written with **Vitest** and located in `Backend/tests/`. Current test coverage includes:

- `ingestion.test.ts` — Ingestion pipeline integration tests
- `rag.test.ts` — RAG query service tests

---

## 🚀 Deployment

### ☁️ Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure the service:
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Environment**: `Node`
4. Add all required environment variables in the Render dashboard (see [Environment Variables](#-environment-variables))
5. Deploy — Render will automatically build and start your service

### ▲ Frontend (Vercel)

1. Import the project on [Vercel](https://vercel.com)
2. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add the environment variable:
   - `VITE_API_URL` → your deployed backend URL (e.g., `https://github-analyzer-f6do.onrender.com`)
4. Deploy — Vercel will automatically build and serve your frontend

---

## ⚠️ Known Limitations

- 🔒 **Private repositories** are not supported — the system only works with public GitHub repos
- 📏 **Large monolithic repos** may hit Gemini API embedding rate limits during indexing
- 💾 **Ephemeral storage** — cloned repos use temporary disk space on the server, which may be constrained on free-tier hosting
- ⏱️ **Cold starts** — the backend on Render's free tier may experience initial delays due to cold starts
- 🌐 **No real-time sync** — if the repository is updated after indexing, you need to re-index to get the latest code

---

## 👥 Team

| Name               | Roll No     | GitHub                                                        |
| ------------------ | ----------- | ------------------------------------------------------------- |
| 🧑‍💻 Varshad Potle  | 23005055    | [@Varshad-Potle](https://github.com/Varshad-Potle)           |
| 🧑‍💻 Vinay Sharma   | 23005060    | [@shekhar-vinay](https://github.com/shekhar-vinay)           |
| 🧑‍💻 Yash Pathak    | 23005064    | —                                                             |

**Guided by:**
- 👨‍🏫 Mr. Milind Waghmare
- 👨‍🏫 Mr. Ravi Mante

---

## 🏛️ Organization

> 🎓 **Government College of Engineering, Amravati**
>
> Department of Computer Science and Engineering
> Semester 6 · Minor Project · 2026

Built as part of the academic minor project curriculum. The application demonstrates practical implementation of modern AI/ML concepts including vector embeddings, semantic search, and retrieval-augmented generation in a real-world software engineering context.

---

<p align="center">
  Made with ❤️ by the GitHub Code Analyzer team
</p>
