import { cloneRepo, readRepoFiles, buildFileTree, cleanupCloneDir, makeTempDir } from './git';
import { chunkFiles } from './chunker';
import { embedChunks } from './embeddings';
import { upsertVectors, namespaceExists, deleteNamespace } from './vectorStore';
import { repoUrlToNamespace, normalizeRepoUrl } from '../utils/helpers';
import type { IndexResponse, FileTreeItem } from '../types';

// In-memory store for file trees — persists as long as server is running
// Good enough for a college project; no database needed
const fileTreeStore = new Map<string, FileTreeItem[]>();

// ─── Main Ingestion Pipeline ──────────────────────────────────────────────────

export async function ingestRepo(repoUrl: string): Promise<IndexResponse> {
    const url = normalizeRepoUrl(repoUrl);
    const namespace = repoUrlToNamespace(url);
    const cloneDir = makeTempDir();

    console.log(`[ingestion] starting for ${url}`);
    console.log(`[ingestion] namespace: ${namespace}`);

    try {
        // Step 1 — Clone
        await cloneRepo(url, cloneDir);

        // Step 2 — Read files
        const repoFiles = await readRepoFiles(cloneDir);
        if (repoFiles.length === 0) {
            throw new Error('No indexable files found in this repository.');
        }

        // Step 3 — Build and store file tree
        const fileTree = buildFileTree(repoFiles);
        fileTreeStore.set(namespace, fileTree);

        // Step 4 — Chunk
        const chunks = await chunkFiles(repoFiles, url);

        // Step 5 — Embed
        const vectors = await embedChunks(chunks);

        // Step 6 — If already indexed, clear old vectors first
        if (await namespaceExists(namespace)) {
            console.log(`[ingestion] namespace exists, clearing old vectors`);
            await deleteNamespace(namespace);
        }

        // Step 7 — Upsert to Pinecone
        await upsertVectors(vectors, namespace);

        console.log(`[ingestion] complete ✓`);

        return {
            message: 'Repository indexed successfully',
            repoUrl: url,
            filesIndexed: repoFiles.length,
            chunksIndexed: chunks.length,
        };
    } finally {
        // Always clean up the clone, even if something threw
        cleanupCloneDir(cloneDir);
    }
}

// ─── File Tree Retrieval ──────────────────────────────────────────────────────

export function getFileTree(repoUrl: string): FileTreeItem[] | null {
    const namespace = repoUrlToNamespace(normalizeRepoUrl(repoUrl));
    return fileTreeStore.get(namespace) ?? null;
}

export function getNamespace(repoUrl: string): string {
    return repoUrlToNamespace(normalizeRepoUrl(repoUrl));
}