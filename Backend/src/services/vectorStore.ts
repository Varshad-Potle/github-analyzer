import { Pinecone } from '@pinecone-database/pinecone';
import env from '../config/env';
import type { VectorRecord, CodeChunk } from '../types';

const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY });
const index = pinecone.index(env.PINECONE_INDEX_NAME);

const UPSERT_BATCH_SIZE = 100;

// ─── Upsert ───────────────────────────────────────────────────────────────────

export async function upsertVectors(
    vectors: VectorRecord[],
    namespace: string
): Promise<void> {
    const ns = index.namespace(namespace);

    for (let i = 0; i < vectors.length; i += UPSERT_BATCH_SIZE) {
        const batch = vectors.slice(i, i + UPSERT_BATCH_SIZE);
        const batchNumber = Math.floor(i / UPSERT_BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(vectors.length / UPSERT_BATCH_SIZE);

        console.log(`[pinecone] upserting batch ${batchNumber}/${totalBatches}`);

        await ns.upsert(
            batch.map(v => ({
                id: v.id,
                values: v.values,
                metadata: {
                    text: v.metadata.text,
                    filePath: v.metadata.filePath,
                    repoUrl: v.metadata.repoUrl,
                    language: v.metadata.language,
                    chunkIndex: v.metadata.chunkIndex,
                },
            }))
        );
    }

    console.log(`[pinecone] upserted ${vectors.length} vectors to namespace "${namespace}"`);
}

// ─── Query ────────────────────────────────────────────────────────────────────

export async function queryVectors(
    queryVector: number[],
    namespace: string,
    topK: number = 6
): Promise<CodeChunk[]> {
    const ns = index.namespace(namespace);

    const result = await ns.query({
        vector: queryVector,
        topK,
        includeMetadata: true,
    });

    return (result.matches ?? [])
        .filter(m => m.metadata)
        .map(m => m.metadata as unknown as CodeChunk);
}

// ─── Namespace exists check ───────────────────────────────────────────────────

export async function namespaceExists(namespace: string): Promise<boolean> {
    try {
        const stats = await index.describeIndexStats();
        return !!stats.namespaces?.[namespace];
    } catch {
        return false;
    }
}

// ─── Delete namespace ─────────────────────────────────────────────────────────

export async function deleteNamespace(namespace: string): Promise<void> {
    try {
        await index.namespace(namespace).deleteAll();
        console.log(`[pinecone] deleted namespace "${namespace}"`);
    } catch (err: any) {
        // 404 means namespace doesn't exist — that's fine, continue
        if (err?.status === 404 || err?.message?.includes('404')) {
            console.log(`[pinecone] namespace "${namespace}" not found, skipping delete`);
        } else {
            throw err;
        }
    }
}