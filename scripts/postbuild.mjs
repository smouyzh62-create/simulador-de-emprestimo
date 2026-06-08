import { cpSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = resolve(__dirname, '..', 'dist');
cpSync(resolve(distDir, 'index.html'), resolve(distDir, '404.html'));
console.log('[postbuild] 404.html created');
