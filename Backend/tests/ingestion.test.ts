import { describe, it, expect } from 'vitest';
import { isValidGithubUrl, normalizeRepoUrl, repoUrlToNamespace, makeVectorId } from '../src/utils/helpers';
import { isAllowedFile, getLanguage } from '../src/utils/fileFilter';

// ─── helpers.ts ───────────────────────────────────────────────────────────────

describe('isValidGithubUrl', () => {
    it('accepts a valid github url', () => {
        expect(isValidGithubUrl('https://github.com/expressjs/express')).toBe(true);
    });

    it('accepts url with trailing slash', () => {
        expect(isValidGithubUrl('https://github.com/expressjs/express/')).toBe(true);
    });

    it('rejects a non-github url', () => {
        expect(isValidGithubUrl('https://gitlab.com/user/repo')).toBe(false);
    });

    it('rejects a plain string', () => {
        expect(isValidGithubUrl('not-a-url')).toBe(false);
    });

    it('rejects github root url', () => {
        expect(isValidGithubUrl('https://github.com')).toBe(false);
    });
});

describe('normalizeRepoUrl', () => {
    it('strips .git suffix', () => {
        expect(normalizeRepoUrl('https://github.com/user/repo.git')).toBe('https://github.com/user/repo');
    });

    it('strips trailing slash', () => {
        expect(normalizeRepoUrl('https://github.com/user/repo/')).toBe('https://github.com/user/repo');
    });

    it('leaves clean url unchanged', () => {
        expect(normalizeRepoUrl('https://github.com/user/repo')).toBe('https://github.com/user/repo');
    });
});

describe('repoUrlToNamespace', () => {
    it('produces a consistent namespace for the same url', () => {
        const a = repoUrlToNamespace('https://github.com/user/repo');
        const b = repoUrlToNamespace('https://github.com/user/repo');
        expect(a).toBe(b);
    });

    it('produces different namespaces for different urls', () => {
        const a = repoUrlToNamespace('https://github.com/user/repo1');
        const b = repoUrlToNamespace('https://github.com/user/repo2');
        expect(a).not.toBe(b);
    });

    it('namespace is lowercase with no spaces', () => {
        const ns = repoUrlToNamespace('https://github.com/MyUser/MyRepo');
        expect(ns).toBe(ns.toLowerCase());
        expect(ns).not.toContain(' ');
    });
});

describe('makeVectorId', () => {
    it('produces consistent id for same inputs', () => {
        const a = makeVectorId('https://github.com/user/repo', 'src/index.ts', 0);
        const b = makeVectorId('https://github.com/user/repo', 'src/index.ts', 0);
        expect(a).toBe(b);
    });

    it('produces different ids for different chunk indexes', () => {
        const a = makeVectorId('https://github.com/user/repo', 'src/index.ts', 0);
        const b = makeVectorId('https://github.com/user/repo', 'src/index.ts', 1);
        expect(a).not.toBe(b);
    });
});

// ─── fileFilter.ts ────────────────────────────────────────────────────────────

describe('isAllowedFile', () => {
    it('allows typescript files', () => {
        expect(isAllowedFile('src/index.ts')).toBe(true);
    });

    it('allows javascript files', () => {
        expect(isAllowedFile('src/app.js')).toBe(true);
    });

    it('blocks node_modules', () => {
        expect(isAllowedFile('node_modules/express/index.js')).toBe(false);
    });

    it('blocks .git directory', () => {
        expect(isAllowedFile('.git/config')).toBe(false);
    });

    it('blocks package-lock.json', () => {
        expect(isAllowedFile('package-lock.json')).toBe(false);
    });

    it('blocks image files', () => {
        expect(isAllowedFile('assets/logo.png')).toBe(false);
    });

    it('blocks dist directory', () => {
        expect(isAllowedFile('dist/index.js')).toBe(false);
    });
});

describe('getLanguage', () => {
    it('detects typescript', () => {
        expect(getLanguage('src/index.ts')).toBe('typescript');
    });

    it('detects python', () => {
        expect(getLanguage('main.py')).toBe('python');
    });

    it('detects markdown', () => {
        expect(getLanguage('README.md')).toBe('markdown');
    });

    it('returns plaintext for unknown extensions', () => {
        expect(getLanguage('Makefile.xyz')).toBe('plaintext');
    });
});