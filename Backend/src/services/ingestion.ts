import { cloneRepo, readRepoFiles, buildFileTree, cleanupCloneDir, makeTempDir } from './git';
import { chunkFiles } from './chunker';
import { embedChunks } from './embeddings';
import { upsertVectors, namespaceExists, deleteNamespace } from './vectorStore';
import { saveRepo, getRepo } from './database';
import { repoUrlToNamespace, normalizeRepoUrl } from '../utils/helpers';
import type { IndexResponse, FileTreeItem } from '../types';

// In-memory cache — populated from MongoDB on demand
const fileTreeCache = new Map<string, FileTreeItem[]>();

export async function ingestRepo(repoUrl: string): Promise<IndexResponse> {
    const url = normalizeRepoUrl(repoUrl);
    const namespace = repoUrlToNamespace(url);
    const cloneDir = makeTempDir();

    console.log(`[ingestion] starting for ${url}`);
    console.log(`[ingestion] namespace: ${namespace}`);

    try {
        await cloneRepo(url, cloneDir);

        const repoFiles = await readRepoFiles(cloneDir);
        if (repoFiles.length === 0) throw new Error('No indexable files found in this repository.');

        const fileTree = buildFileTree(repoFiles);
        fileTreeCache.set(namespace, fileTree);

        const chunks = await chunkFiles(repoFiles, url);
        const vectors = await embedChunks(chunks);

        if (await namespaceExists(namespace)) {
            console.log(`[ingestion] namespace exists, clearing old vectors`);
            await deleteNamespace(namespace);
        }

        await upsertVectors(vectors, namespace);

        await saveRepo({
            repoUrl: url,
            namespace,
            fileTree,
            filesCount: repoFiles.length,
            chunksCount: chunks.length,
            indexedAt: new Date(),
        });

        console.log(`[ingestion] complete ✓`);

        return {
            message: 'Repository indexed successfully',
            repoUrl: url,
            filesIndexed: repoFiles.length,
            chunksIndexed: chunks.length,
        };
    } finally {
        cleanupCloneDir(cloneDir);
    }
}

export async function getFileTree(repoUrl: string): Promise<FileTreeItem[] | null> {
    const namespace = repoUrlToNamespace(normalizeRepoUrl(repoUrl));

    if (fileTreeCache.has(namespace)) {
        return fileTreeCache.get(namespace)!;
    }

    const record = await getRepo(normalizeRepoUrl(repoUrl));
    if (record) {
        fileTreeCache.set(namespace, record.fileTree);
        return record.fileTree;
    }

    return null;
}

export function getNamespace(repoUrl: string): string {
    return repoUrlToNamespace(normalizeRepoUrl(repoUrl));
}