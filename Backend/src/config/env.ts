import { cleanEnv, str, port } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

const env = cleanEnv(process.env, {
    GEMINI_API_KEY: str(),
    PINECONE_API_KEY: str(),
    PINECONE_INDEX_NAME: str(),
    GITHUB_TOKEN: str(),
    MONGODB_URI: str(),
    PORT: port({ default: 3000 }),
    NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
});

export default env;