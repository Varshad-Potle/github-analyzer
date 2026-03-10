import app from './app';
import env from './config/env';

app.listen(env.PORT, () => {
    console.log(`[server] running on http://localhost:${env.PORT}`);
    console.log(`[server] environment: ${env.NODE_ENV}`);
});

// const testDir = makeTempDir();
// cloneRepo('https://github.com/expressjs/express', testDir)
//     .then(() => readRepoFiles(testDir))
//     .then(files => {
//         console.log(`[test] got ${files.length} files`);
//         console.log('[test] sample:', files[0]?.filePath);
//         cleanupCloneDir(testDir);
//     })
//     .catch(console.error);

import { cloneRepo, readRepoFiles, makeTempDir, cleanupCloneDir } from './services/git';
import { chunkFiles } from './services/chunker';
import { embedChunks } from './services/embeddings';

// const testDir = makeTempDir();
// cloneRepo('https://github.com/expressjs/express', testDir)
//     .then(() => readRepoFiles(testDir))
//     .then(files => chunkFiles(files, 'https://github.com/expressjs/express'))
//     .then(chunks => {
//         console.log(`[test] chunking done: ${chunks.length} chunks`);
//         // Only embed the first 3 chunks to avoid burning free quota on a test
//         return embedChunks(chunks.slice(0, 3));
//     })
//     .then(vectors => {
//         console.log(`[test] got ${vectors.length} vectors`);
//         console.log(`[test] vector dimensions: ${vectors[0].values.length}`);
//         console.log(`[test] sample id: ${vectors[0].id}`);
//         cleanupCloneDir(testDir);
//     })
//     .catch(console.error);