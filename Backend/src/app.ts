import express, { Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import reposRouter from './routes/repos';
import chatRouter from './routes/chat';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/repos', reposRouter);

app.use('/api/chat', chatRouter);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;