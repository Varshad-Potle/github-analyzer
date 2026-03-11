import { GoogleGenerativeAI } from '@google/generative-ai';
import { embedQuery } from './embeddings';
import { queryVectors, namespaceExists } from './vectorStore';
import { getNamespace } from './ingestion';
import { normalizeRepoUrl } from '../utils/helpers';
import env from '../config/env';
import type { QueryResponse } from '../types';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const llm = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ─── Core RAG Query ───────────────────────────────────────────────────────────

export async function queryRepo(
    question: string,
    repoUrl: string,
    topK: number = 6
): Promise<QueryResponse> {
    const url = normalizeRepoUrl(repoUrl);
    const namespace = getNamespace(url);

    // Confirm repo is indexed
    if (!(await namespaceExists(namespace))) {
        throw Object.assign(
            new Error('Repository not indexed. Run POST /api/repos/index first.'),
            { statusCode: 404 }
        );
    }

    console.log(`[rag] question: "${question}"`);

    // Step 1 — Embed the question
    const queryVector = await embedQuery(question);

    // Step 2 — Retrieve relevant chunks from Pinecone
    const chunks = await queryVectors(queryVector, namespace, topK);

    if (chunks.length === 0) {
        return {
            answer: 'No relevant code found for your question.',
            sources: [],
        };
    }

    // Step 3 — Build prompt
    const context = chunks
        .map((c, i) => `--- Chunk ${i + 1} (${c.filePath}) ---\n${c.text}`)
        .join('\n\n');

    const prompt = `You are an expert code analyst. A user is asking a question about a GitHub repository.

Use ONLY the code chunks provided below to answer the question. Be specific and reference file names when relevant.
If the answer cannot be determined from the provided chunks, say so clearly.

CODE CONTEXT:
${context}

QUESTION: ${question}

ANSWER:`;

    // Step 4 — Generate answer
    console.log(`[rag] sending ${chunks.length} chunks to Gemini`);
    const result = await llm.generateContent(prompt);
    const answer = result.response.text();

    // Step 5 — Build source references
    const seen = new Set<string>();
    const sources = chunks
        .filter(c => {
            if (seen.has(c.filePath)) return false;
            seen.add(c.filePath);
            return true;
        })
        .map(c => ({
            filePath: c.filePath,
            snippet: c.text.slice(0, 200).trim() + '...',
        }));

    console.log(`[rag] answer generated, ${sources.length} source files`);

    return { answer, sources };
}

// ─── Generate README ──────────────────────────────────────────────────────────

export async function generateReadme(repoUrl: string): Promise<string> {
    const url = normalizeRepoUrl(repoUrl);
    const namespace = getNamespace(url);

    if (!(await namespaceExists(namespace))) {
        throw Object.assign(
            new Error('Repository not indexed. Run POST /api/repos/index first.'),
            { statusCode: 404 }
        );
    }

    // Retrieve a broad set of chunks to understand the whole repo
    const queryVector = await embedQuery('project overview structure purpose main functionality');
    const chunks = await queryVectors(queryVector, namespace, 12);

    const context = chunks
        .map(c => `--- ${c.filePath} ---\n${c.text}`)
        .join('\n\n');

    const prompt = `You are a technical writer. Based on the code below, generate a clean, professional README.md.

Include:
- Project name and description
- Tech stack / languages used
- How to run / install
- Key features
- Folder structure (if apparent)

Keep it concise. Use proper markdown formatting.

CODE:
${context}

README.md:`;

    const result = await llm.generateContent(prompt);
    return result.response.text();
}

// ─── Explain a File ───────────────────────────────────────────────────────────

export async function explainFile(
    filePath: string,
    repoUrl: string
): Promise<string> {
    const url = normalizeRepoUrl(repoUrl);
    const namespace = getNamespace(url);

    if (!(await namespaceExists(namespace))) {
        throw Object.assign(
            new Error('Repository not indexed. Run POST /api/repos/index first.'),
            { statusCode: 404 }
        );
    }

    // Query specifically about this file
    const queryVector = await embedQuery(`explain the file ${filePath}`);
    const chunks = await queryVectors(queryVector, namespace, 8);

    // Filter to chunks from this file first, fall back to related chunks
    const fileChunks = chunks.filter(c => c.filePath === filePath);
    const contextChunks = fileChunks.length > 0 ? fileChunks : chunks;

    const context = contextChunks
        .map(c => c.text)
        .join('\n\n');

    const prompt = `You are an expert code reviewer. Explain the following code from the file "${filePath}".

Cover:
- What this file does
- Key functions / classes and their purpose
- How it connects to the rest of the project
- Any important patterns or decisions

CODE:
${context}

EXPLANATION:`;

    const result = await llm.generateContent(prompt);
    return result.response.text();
}