import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env';
import type { CodeChunk, VectorRecord } from '../types';
import { makeVectorId, repoUrlToNamespace } from '../utils/helpers';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel(
    { model: 'gemini-embedding-001' },
    { apiVersion: 'v1beta' }
);

// Gemini embedding API allows max 100 texts per batch request
const BATCH_SIZE = 100;

// ─── Embed a single query string (used at query time) ─────────────────────────
export async function embedQuery(text: string): Promise<number[]> {
    const result = await model.embedContent(text);
    return result.embedding.values;
}

// ─── Embed chunks in batches and return VectorRecords ─────────────────────────
export async function embedChunks(chunks: CodeChunk[]): Promise<VectorRecord[]> {
    const vectors: VectorRecord[] = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);

        console.log(`[embeddings] batch ${batchNumber}/${totalBatches} (${batch.length} chunks)`);

        // Embed all chunks in the batch concurrently
        const embedResults = await Promise.all(
            batch.map(chunk => model.embedContent(chunk.text))
        );

        batch.forEach((chunk, idx) => {
            vectors.push({
                id: makeVectorId(chunk.repoUrl, chunk.filePath, chunk.chunkIndex),
                values: embedResults[idx].embedding.values,
                metadata: chunk,
            });
        });

        // Small delay between batches to avoid hitting rate limits
        if (i + BATCH_SIZE < chunks.length) {
            await sleep(500);
        }
    }

    console.log(`[embeddings] generated ${vectors.length} vectors`);
    return vectors;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}