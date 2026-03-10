import app from './app';
import env from './config/env';

app.listen(env.PORT, () => {
    console.log(`[server] running on http://localhost:${env.PORT}`);
    console.log(`[server] environment: ${env.NODE_ENV}`);
});
import { cloneRepo, readRepoFiles, makeTempDir, cleanupCloneDir } from './services/git';

// const testDir = makeTempDir();
// cloneRepo('https://github.com/expressjs/express', testDir)
//     .then(() => readRepoFiles(testDir))
//     .then(files => {
//         console.log(`[test] got ${files.length} files`);
//         console.log('[test] sample:', files[0]?.filePath);
//         cleanupCloneDir(testDir);
//     })
//     .catch(console.error);