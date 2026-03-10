import crypto from 'crypto';

// Turns a repo URL into a safe Pinecone namespace
// e.g. https://github.com/user/repo → "user-repo-a1b2c3"
export function repoUrlToNamespace(repoUrl: string): string {
    const hash = crypto.createHash('sha256').update(repoUrl).digest('hex').slice(0, 6);
    const slug = repoUrl
        .replace(/https?:\/\/github\.com\//, '')
        .replace(/[^a-zA-Z0-9]/g, '-')
        .toLowerCase()
        .slice(0, 40);
    return `${slug}-${hash}`;
}

// Generates a unique vector ID for a chunk
export function makeVectorId(repoUrl: string, filePath: string, chunkIndex: number): string {
    const base = `${repoUrl}::${filePath}::${chunkIndex}`;
    return crypto.createHash('sha256').update(base).digest('hex').slice(0, 32);
}

// Cleans a GitHub URL — strips .git suffix and trailing slashes
export function normalizeRepoUrl(url: string): string {
    return url.replace(/\.git$/, '').replace(/\/$/, '').trim();
}

// Validates that a URL looks like a GitHub repo URL
export function isValidGithubUrl(url: string): boolean {
    return /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\/)?$/.test(
        normalizeRepoUrl(url)
    );
}