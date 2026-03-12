import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { getFileTree, getNamespace } from '../services/ingestion';
import { namespaceExists } from '../services/vectorStore';
import { isValidGithubUrl, normalizeRepoUrl } from '../utils/helpers';

const router = Router();

// ─── GET /api/files ───────────────────────────────────────────────────────────
// Returns the file tree of an indexed repo

router.get('/', async (req: Request, res: Response) => {
    const repoUrl = req.query.repoUrl as string;

    if (!repoUrl) {
        res.status(400).json({ error: 'repoUrl query param is required' });
        return;
    }

    if (!isValidGithubUrl(repoUrl)) {
        res.status(400).json({ error: 'Must be a valid public GitHub repository URL' });
        return;
    }

    const namespace = getNamespace(repoUrl);
    if (!(await namespaceExists(namespace))) {
        res.status(404).json({ error: 'Repo not indexed yet. Run POST /api/repos/index first.' });
        return;
    }

    const tree = getFileTree(repoUrl);

    if (!tree) {
        res.status(404).json({ error: 'File tree not found. Please re-index this repository.' });
        return;
    }

    res.json({ files: tree });
});

// ─── GET /api/files/content ───────────────────────────────────────────────────
// Returns raw content of a specific file from an indexed repo

router.get('/content', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const repoUrl = req.query.repoUrl as string;
        const filePath = req.query.filePath as string;

        if (!repoUrl || !filePath) {
            res.status(400).json({ error: 'repoUrl and filePath query params are required' });
            return;
        }

        if (!isValidGithubUrl(repoUrl)) {
            res.status(400).json({ error: 'Must be a valid public GitHub repository URL' });
            return;
        }

        const normalizedPath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
        if (normalizedPath !== filePath) {
            res.status(400).json({ error: 'Invalid file path' });
            return;
        }

        const tree = await getFileTree(repoUrl);   // ← add await here
        if (!tree) {
            res.status(404).json({ error: 'Repo not indexed yet. Run POST /api/repos/index first.' });
            return;
        }

        const fileEntry = tree.find(f => f.filePath === filePath);
        if (!fileEntry) {
            res.status(404).json({ error: `File "${filePath}" not found in indexed repo.` });
            return;
        }

        // Re-fetch file content directly from GitHub raw URL
        // This avoids keeping all file contents in memory
        const url = normalizeRepoUrl(repoUrl);
        const repoPath = url.replace('https://github.com/', '');
        const rawUrl = `https://raw.githubusercontent.com/${repoPath}/HEAD/${filePath}`;

        try {
            const response = await fetch(rawUrl, {
                headers: process.env.GITHUB_TOKEN
                    ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
                    : {},
            });

            if (!response.ok) {
                res.status(404).json({ error: `Could not fetch file content from GitHub.` });
                return;
            }

            const content = await response.text();
            res.json({
                filePath,
                language: fileEntry.language,
                content,
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch file content.' });
        }
    } catch (error) {
        next(error);
    }
});

export default router;