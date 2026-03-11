import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { queryRepo, generateReadme, explainFile } from '../services/rag';
import { isValidGithubUrl } from '../utils/helpers';

const router = Router();

// ─── POST /api/chat/query ─────────────────────────────────────────────────────

const QuerySchema = z.object({
    question: z.string().min(1, 'question is required'),
    repoUrl: z.string().url('Must be a valid URL'),
    topK: z.number().min(1).max(12).optional(),
});

router.post('/query', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, repoUrl, topK } = QuerySchema.parse(req.body);

        if (!isValidGithubUrl(repoUrl)) {
            res.status(400).json({ error: 'Must be a valid public GitHub repository URL' });
            return;
        }

        const result = await queryRepo(question, repoUrl, topK);
        res.json(result);
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.errors[0].message });
            return;
        }
        next(err);
    }
});

// ─── POST /api/chat/generate-readme ──────────────────────────────────────────

const RepoUrlSchema = z.object({
    repoUrl: z.string().url('Must be a valid URL'),
});

router.post('/generate-readme', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { repoUrl } = RepoUrlSchema.parse(req.body);

        if (!isValidGithubUrl(repoUrl)) {
            res.status(400).json({ error: 'Must be a valid public GitHub repository URL' });
            return;
        }

        const readme = await generateReadme(repoUrl);
        res.json({ readme });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.errors[0].message });
            return;
        }
        next(err);
    }
});

// ─── POST /api/chat/explain ───────────────────────────────────────────────────

const ExplainSchema = z.object({
    filePath: z.string().min(1, 'filePath is required'),
    repoUrl: z.string().url('Must be a valid URL'),
});

router.post('/explain', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { filePath, repoUrl } = ExplainSchema.parse(req.body);

        if (!isValidGithubUrl(repoUrl)) {
            res.status(400).json({ error: 'Must be a valid public GitHub repository URL' });
            return;
        }

        const explanation = await explainFile(filePath, repoUrl);
        res.json({ explanation });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.errors[0].message });
            return;
        }
        next(err);
    }
});

export default router;