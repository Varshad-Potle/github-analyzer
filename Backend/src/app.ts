import express, { Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';

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

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;