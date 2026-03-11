# 🔍 GitHub Code Analyzer

## 📖 Overview
GitHub Code Analyzer is a robust backend service designed to index public GitHub repositories and provide an intelligent, conversational interface to interact with the codebase. By leveraging Retrieval-Augmented Generation (RAG) using Google's Gemini AI and the Pinecone Vector Database, it allows users to deeply query code context, instantly generate dynamic readmes, and request clear file-specific explanations.

## 🚀 Live Demo
 [https://github-analyzer-f6do.onrender.com](https://github-analyzer-f6do.onrender.com/)

## 🛠️ Tech Stack
- **Runtime & Framework**: Node.js, Express
- **Language**: TypeScript
- **AI & Processing**: Google Gemini AI (Embeddings & LLM), LangChain Text Splitters
- **Database**: Pinecone (Vector Database)
- **Utilities**: simple-git, zod (Validation), pino (Logging)
- **Testing**: Vitest

## 🏗️ Architecture

```text
+----------------+          +------------------------+
|    👤 User     | =======> | 💻 Express API Gateway |
+----------------+          +------------------------+
                                        |
       +--------------------------------+--------------------------------+
       |                                |                                |
       v                                v                                v
+----------------+             +-----------------+              +----------------+
| Repo Ingestion |             |   RAG Service   |              |  File Fetcher  |
| (/repos/index) |             |    (/chat/*)    |              |   (/files/*)   |
+----------------+             +-----------------+              +----------------+
       |                                |                                |
       | 1. Clone Repo                  | 1. Embed Query                 | Fetch File
       | 2. Chunk Code (LangChain)      | 2. Retrieve Context (Pinecone)| 
       | 3. Embed & Upsert (Gemini)     | 3. Generate Answer (Gemini)    |
       v                                v                                v
+--------------------------------------------------------------------------------+
|                        🤖 AI & External Systems                                |
|                                                                                |
|    [✨ Google Gemini 2.0]        [🌲 Pinecone DB]           [🐙 GitHub API]    |
+--------------------------------------------------------------------------------+
```

1. **Repository Ingestion (`/api/repos/index`)**: The backend clones a public GitHub repository, traverses its file structure, and chunks the source code using LangChain methodologies. Vector embeddings are generated using Gemini and subsequently upserted into a Pinecone index under a repository-specific namespace.
2. **File Browsing & State (`/api/files`)**: Offers an endpoint to fetch the current repository file tree and fetch real-time raw file contents directly from GitHub using a GitHub token to avoid persistent extensive file storage.
3. **Retrieval-Augmented Generation (`/api/chat/*`)**: Retrieves relevant, semantically similar code snippets from Pinecone based on user queries or file paths, and provides this context to the Gemini LLM to generate precise, context-aware answers or extensive formatted documentation.

## 🏁 Getting Started

### 📋 Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- A [Pinecone](https://pinecone.io/) Account and Index
- A [Google Gemini API Key](https://aistudio.google.com/)
- A [GitHub Personal Access Token](https://github.com/settings/tokens) (Optional but strictly recommended for API rate limiting)

### 💻 Installation
1. Clone the repository and navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### ⚙️ Environment Variables
Create a `.env` file in the root `Backend` directory containing the following:
```env
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=github-analyzer
GITHUB_TOKEN=your_github_token
GEMINI_MODEL=gemini-2.0-flash
PORT=3000
```

## 📚 API Reference

### 📥 POST /api/repos/index
Ingests and indexes a public GitHub repository into the vector database.
- **Body**: `{ "repoUrl": "https://github.com/user/repo" }`

### 💬 POST /api/chat/query
Queries the indexed repository codebase based on a user's question using RAG.
- **Body**: `{ "question": "What does the auth middleware do?", "repoUrl": "https://github.com/user/repo", "topK": 5 }`

### 📝 POST /api/chat/generate-readme
Generates a comprehensive README for an indexed repository based on the analyzed code context.
- **Body**: `{ "repoUrl": "https://github.com/user/repo" }`

### 💡 POST /api/chat/explain
Provides an in-depth AI-generated explanation for a specific file within an indexed repository.
- **Body**: `{ "filePath": "src/utils/auth.ts", "repoUrl": "https://github.com/user/repo" }`

### 📂 GET /api/files
Retrieves the nested file tree (structure) of an indexed repository.
- **Query Params**: `?repoUrl=https://github.com/user/repo`

### 📄 GET /api/files/content
Fetches the raw string content of a specific file directly from the GitHub repository.
- **Query Params**: `?repoUrl=https://github.com/user/repo&filePath=src/utils/auth.ts`

### ❤️ GET /health
Health check endpoint providing status, overall uptime, and current server timestamp.

## 🗂️ Project Structure
```text
Backend/
├── src/
│   ├── config/      # Environment variables and API client configurations
│   ├── middleware/  # Express middlewares (e.g., Global Error Handling, CORS)
│   ├── routes/      # Express API route group definitions
│   ├── services/    # Core business systems (Git handling, RAG, Chunking, Vectors)
│   ├── types/       # TypeScript interfaces and global type definitions
│   ├── utils/       # Shared utility and helper scripts
│   ├── app.ts       # Express app initialization mapping
│   └── server.ts    # Application entry point/HTTP server
├── tests/           # Vitest integration and unit testing modules
└── package.json     # Dependency tracking and command scripts
```

## 🧪 Running Tests
Run the testing suite defined via Vitest utilizing the enclosed test directory:
```bash
npm run test
```
For continuous watching during development:
```bash
npm run test:watch
```

## 🚀 Deployment
Can be optimally deployed via containerization algorithms or direct deployment platforms (e.g., Render, Railway, AWS ECS, or Vercel edge/node deployment).
* Ensure your Pinecone database is securely available to the deployed instance.
* Supply all necessary `.env` variables via the provider's secret management panel.

## ⚠️ Known Limitations
- Access to private repositories is non-functional without modifying Git cloning workflows.
- Indexing profoundly large (monolithic) repositories may trigger provider rate limits on Gemini Embedding APIs.
- The repository clone operation allocates file system resources directly onto the instance—ephemeral disk storage constraints could become noticeable for extensive organizations.
