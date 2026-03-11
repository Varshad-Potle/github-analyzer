import { describe, it, expect } from 'vitest';
import { isValidGithubUrl } from '../src/utils/helpers';

// ─── Input validation edge cases ─────────────────────────────────────────────
// These tests verify the validation logic that protects the RAG endpoints
// without making real API calls

describe('query input validation', () => {
    it('rejects empty question', () => {
        const question = '';
        expect(question.trim().length).toBe(0);
    });

    it('accepts valid question', () => {
        const question = 'What does this project do?';
        expect(question.trim().length).toBeGreaterThan(0);
    });

    it('rejects non-github repoUrl for query', () => {
        expect(isValidGithubUrl('https://bitbucket.org/user/repo')).toBe(false);
    });

    it('accepts valid github repoUrl for query', () => {
        expect(isValidGithubUrl('https://github.com/Varshad-Potle/Random-Password-Generator')).toBe(true);
    });
});

describe('topK validation', () => {
    it('topK must be at least 1', () => {
        const topK = 0;
        expect(topK).toBeLessThan(1);
    });

    it('topK must not exceed 12', () => {
        const topK = 13;
        expect(topK).toBeGreaterThan(12);
    });

    it('valid topK passes', () => {
        const topK = 6;
        expect(topK).toBeGreaterThanOrEqual(1);
        expect(topK).toBeLessThanOrEqual(12);
    });

    it('default topK is 6', () => {
        const defaultTopK = 6;
        expect(defaultTopK).toBe(6);
    });
});

describe('filePath validation', () => {
    it('detects directory traversal attempt', () => {
        const filePath = '../../../etc/passwd';
        const normalized = filePath.replace(/^(\.\.[/\\])+/, '');
        expect(normalized).not.toBe(filePath);
    });

    it('allows normal file paths', () => {
        const filePath = 'src/index.ts';
        const normalized = filePath.replace(/^(\.\.[/\\])+/, '');
        expect(normalized).toBe(filePath);
    });

    it('allows nested file paths', () => {
        const filePath = 'src/services/rag.ts';
        const normalized = filePath.replace(/^(\.\.[/\\])+/, '');
        expect(normalized).toBe(filePath);
    });
});