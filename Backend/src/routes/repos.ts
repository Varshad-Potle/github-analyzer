import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ingestRepo, getFileTree } from '../services/ingestion';
import { namespaceExists, deleteNamespace } from '../services/vectorStore';
import { isValidGithubUrl, repoUrlToNamespace, normalizeRepoUrl } from '../utils/helpers';
import { getAllRepos } from '../services/database';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const repos = await getAllRepos();
        res.json({ repos });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/repos/index ────────────────────────────────────────────────────

const IndexSchema = z.object({
    repoUrl: z.string().url('Must be a valid URL'),
});

router.post('/index', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { repoUrl } = IndexSchema.parse(req.body);

        if (!isValidGithubUrl(repoUrl)) {
            res.status(400).json({ error: 'Must be a valid public GitHub repository URL' });
            return;
        }

        const result = await ingestRepo(repoUrl);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.errors[0].message });
            return;
        }
        next(err);
    }
});

// ─── GET /api/repos/files ─────────────────────────────────────────────────────

router.get('/files', (req: Request, res: Response) => {
    const repoUrl = req.query.repoUrl as string;

    if (!repoUrl) {
        res.status(400).json({ error: 'repoUrl query param is required' });
        return;
    }

    const tree = getFileTree(repoUrl);

    if (!tree) {
        res.status(404).json({ error: 'Repo not indexed yet. Run POST /api/repos/index first.' });
        return;
    }

    res.json({ files: tree });
});

// ─── DELETE /api/repos/:namespace ────────────────────────────────────────────

router.delete('/:namespace', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const namespace = req.params.namespace as string;

        if (!(await namespaceExists(namespace))) {
            res.status(404).json({ error: 'Namespace not found' });
            return;
        }

        await deleteNamespace(namespace);
        res.json({ message: 'Namespace deleted successfully' });
    } catch (err) {
        next(err);
    }
});

export default router;