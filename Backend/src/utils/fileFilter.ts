// Extensions we allow for indexing
export const ALLOWED_EXTENSIONS = new Set([
    // Web
    '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
    // Backend
    '.py', '.go', '.java', '.rb', '.php', '.rs', '.cs',
    // Config / markup
    '.json', '.yaml', '.yml', '.toml', '.env.example',
    // Docs
    '.md', '.mdx',
    // Styles
    '.css', '.scss',
    // Shell
    '.sh', '.bash',
    // C/C++
    '.c', '.cpp', '.h', '.hpp',
]);

// Directory names to always skip
export const IGNORED_DIRS = new Set([
    'node_modules', '.git', 'dist', 'build', '.next',
    'out', 'coverage', '.cache', '__pycache__', '.venv',
    'venv', 'env', 'vendor', 'target', 'bin', 'obj',
]);

// Specific filenames to always skip
export const IGNORED_FILES = new Set([
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    '.DS_Store', 'Thumbs.db',
]);

export function isAllowedFile(filePath: string): boolean {
    const parts = filePath.split('/');

    // Skip if any parent directory is in the ignore list
    for (const part of parts.slice(0, -1)) {
        if (IGNORED_DIRS.has(part)) return false;
    }

    const fileName = parts[parts.length - 1];

    // Skip ignored filenames
    if (IGNORED_FILES.has(fileName)) return false;

    // Check extension
    const ext = '.' + fileName.split('.').pop();
    return ALLOWED_EXTENSIONS.has(ext);
}

export function getLanguage(filePath: string): string {
    const ext = '.' + filePath.split('.').pop();
    const map: Record<string, string> = {
        '.ts': 'typescript', '.tsx': 'typescript',
        '.js': 'javascript', '.jsx': 'javascript',
        '.mjs': 'javascript', '.cjs': 'javascript',
        '.py': 'python', '.go': 'go',
        '.java': 'java', '.rb': 'ruby',
        '.php': 'php', '.rs': 'rust',
        '.cs': 'csharp', '.c': 'c',
        '.cpp': 'cpp', '.h': 'c',
        '.hpp': 'cpp', '.md': 'markdown',
        '.mdx': 'markdown', '.json': 'json',
        '.yaml': 'yaml', '.yml': 'yaml',
        '.toml': 'toml', '.css': 'css',
        '.scss': 'scss', '.sh': 'bash',
        '.bash': 'bash',
    };
    return map[ext] || 'plaintext';
}