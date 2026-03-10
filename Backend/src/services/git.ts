import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fg from 'fast-glob';
import { isAllowedFile, getLanguage } from '../utils/fileFilter';
import { normalizeRepoUrl } from '../utils/helpers';
import type { RepoFile, FileTreeItem } from '../types';

// ─── Clone ────────────────────────────────────────────────────────────────────

export async function cloneRepo(repoUrl: string, cloneDir: string): Promise<void> {
    const url = normalizeRepoUrl(repoUrl);

    // Inject GitHub token for auth if provided
    const token = process.env.GITHUB_TOKEN;
    const authenticatedUrl = token
        ? url.replace('https://', `https://${token}@`)
        : url;

    console.log(`[git] cloning ${url} → ${cloneDir}`);

    await simpleGit().clone(authenticatedUrl, cloneDir, ['--depth=1']);

    console.log(`[git] clone complete`);
}

// ─── Read Files ───────────────────────────────────────────────────────────────

export async function readRepoFiles(cloneDir: string): Promise<RepoFile[]> {
    // Get all files recursively
    const allFiles = await fg('**/*', {
        cwd: cloneDir,
        dot: false,
        onlyFiles: true,
    });

    const allowed = allFiles.filter(isAllowedFile);
    console.log(`[git] ${allFiles.length} total files → ${allowed.length} indexable`);

    const repoFiles: RepoFile[] = [];

    for (const relPath of allowed) {
        const absPath = path.join(cloneDir, relPath);
        try {
            const content = fs.readFileSync(absPath, 'utf-8');

            // Skip empty files and very large files (> 200KB)
            if (!content.trim()) continue;
            if (content.length > 200_000) {
                console.log(`[git] skipping large file: ${relPath}`);
                continue;
            }

            repoFiles.push({
                filePath: relPath,
                content,
                language: getLanguage(relPath),
            });
        } catch {
            console.warn(`[git] could not read ${relPath}, skipping`);
        }
    }

    console.log(`[git] read ${repoFiles.length} files`);
    return repoFiles;
}

// ─── File Tree ────────────────────────────────────────────────────────────────

export function buildFileTree(repoFiles: RepoFile[]): FileTreeItem[] {
    return repoFiles.map(f => ({
        filePath: f.filePath,
        language: f.language,
    }));
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

export function cleanupCloneDir(cloneDir: string): void {
    try {
        fs.rmSync(cloneDir, { recursive: true, force: true });
        console.log(`[git] cleaned up ${cloneDir}`);
    } catch {
        console.warn(`[git] could not clean up ${cloneDir}`);
    }
}

// ─── Temp Dir ─────────────────────────────────────────────────────────────────

export function makeTempDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'gh-analyzer-'));
}