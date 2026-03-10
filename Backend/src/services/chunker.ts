import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { RepoFile, CodeChunk } from '../types';

// Language-aware separators for better chunk boundaries
const LANGUAGE_SEPARATORS: Record<string, string[]> = {
    typescript: ['\nclass ', '\nfunction ', '\nconst ', '\nexport ', '\n\n', '\n', ' '],
    javascript: ['\nclass ', '\nfunction ', '\nconst ', '\nexport ', '\n\n', '\n', ' '],
    python: ['\nclass ', '\ndef ', '\n\n', '\n', ' '],
    go: ['\nfunc ', '\ntype ', '\n\n', '\n', ' '],
    java: ['\nclass ', '\npublic ', '\nprivate ', '\n\n', '\n', ' '],
    rust: ['\nfn ', '\nstruct ', '\nimpl ', '\n\n', '\n', ' '],
    default: ['\n\n', '\n', ' '],
};

export async function chunkFiles(
    repoFiles: RepoFile[],
    repoUrl: string
): Promise<CodeChunk[]> {
    const allChunks: CodeChunk[] = [];

    for (const file of repoFiles) {
        const separators =
            LANGUAGE_SEPARATORS[file.language] ?? LANGUAGE_SEPARATORS.default;

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1500,
            chunkOverlap: 150,
            separators,
        });

        const rawChunks = await splitter.splitText(file.content);

        rawChunks.forEach((text, index) => {
            allChunks.push({
                text,
                filePath: file.filePath,
                repoUrl,
                language: file.language,
                chunkIndex: index,
            });
        });
    }

    console.log(`[chunker] ${repoFiles.length} files → ${allChunks.length} chunks`);
    return allChunks;
}