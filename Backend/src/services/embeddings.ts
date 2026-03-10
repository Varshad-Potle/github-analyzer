import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env';
import type { CodeChunk, VectorRecord } from '../types';
import { makeVectorId } from '../utils/helpers';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel(
    { model: 'gemini-embedding-001' },
    { apiVersion: 'v1beta' }
);

const DELAY_MS = 100;

export async function embedQuery(text: string): Promise<number[]> {
    const result = await model.embedContent(text);
    return result.embedding.values;
}

export async function embedChunks(chunks: CodeChunk[]): Promise<VectorRecord[]> {
    const vectors: VectorRecord[] = [];
    const total = chunks.length;

    for (let i = 0; i < total; i++) {
        if (i % 50 === 0) {
            console.log(`[embeddings] progress: ${i}/${total}`);
        }

        const result = await model.embedContent(chunks[i].text);

        vectors.push({
            id: makeVectorId(chunks[i].repoUrl, chunks[i].filePath, chunks[i].chunkIndex),
            values: result.embedding.values,
            metadata: chunks[i],
        });

        await sleep(DELAY_MS);
    }

    console.log(`[embeddings] generated ${vectors.length} vectors`);
    return vectors;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}