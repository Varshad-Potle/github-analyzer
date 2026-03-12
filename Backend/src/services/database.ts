import { MongoClient, Db } from 'mongodb';
import env from '../config/env';

let client: MongoClient;
let db: Db;

// ─── Connection ───────────────────────────────────────────────────────────────

export async function connectDB(): Promise<void> {
    if (db) return;

    client = new MongoClient(env.MONGODB_URI);
    await client.connect();
    db = client.db('github-analyzer');
    console.log('[mongodb] connected');
}

function getDB(): Db {
    if (!db) throw new Error('Database not connected. Call connectDB() first.');
    return db;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RepoRecord {
    repoUrl: string;
    namespace: string;
    fileTree: { filePath: string; language: string }[];
    filesCount: number;
    chunksCount: number;
    indexedAt: Date;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function saveRepo(record: RepoRecord): Promise<void> {
    const col = getDB().collection<RepoRecord>('repos');
    await col.updateOne(
        { repoUrl: record.repoUrl },
        { $set: record },
        { upsert: true }
    );
    console.log(`[mongodb] saved repo: ${record.repoUrl}`);
}

export async function getRepo(repoUrl: string): Promise<RepoRecord | null> {
    const col = getDB().collection<RepoRecord>('repos');
    return col.findOne({ repoUrl }, { projection: { _id: 0 } });
}

export async function getAllRepos(): Promise<RepoRecord[]> {
    const col = getDB().collection<RepoRecord>('repos');
    return col
        .find({}, { projection: { _id: 0, fileTree: 0 } })
        .sort({ indexedAt: -1 })
        .toArray();
}

export async function deleteRepo(repoUrl: string): Promise<void> {
    const col = getDB().collection<RepoRecord>('repos');
    await col.deleteOne({ repoUrl });
    console.log(`[mongodb] deleted repo: ${repoUrl}`);
}