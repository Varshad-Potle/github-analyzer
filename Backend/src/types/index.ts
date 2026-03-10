// ─── Repo ────────────────────────────────────────────────────────────────────
export interface RepoFile {
    filePath: string;
    content: string;
    language: string;
}

export interface FileTreeItem {
    filePath: string;
    language: string;
}

// ─── Chunks & Vectors ────────────────────────────────────────────────────────
export interface CodeChunk {
    text: string;
    filePath: string;
    repoUrl: string;
    language: string;
    chunkIndex: number;
}

export interface VectorRecord {
    id: string;
    values: number[];
    metadata: CodeChunk;
}

// ─── API Request Bodies ──────────────────────────────────────────────────────
export interface IndexRequestBody {
    repoUrl: string;
}

export interface QueryRequestBody {
    question: string;
    repoUrl: string;
    topK?: number;
}

export interface ExplainRequestBody {
    filePath: string;
    repoUrl: string;
}

export interface GenerateReadmeRequestBody {
    repoUrl: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface QuerySource {
    filePath: string;
    snippet: string;
}

export interface QueryResponse {
    answer: string;
    sources: QuerySource[];
}

export interface IndexResponse {
    message: string;
    repoUrl: string;
    filesIndexed: number;
    chunksIndexed: number;
}