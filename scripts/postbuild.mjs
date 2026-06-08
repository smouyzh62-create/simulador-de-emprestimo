import { cpSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = resolve(__dirname, '..', 'dist');
const projectDir = resolve(__dirname, '..');

cpSync(resolve(distDir, 'index.html'), resolve(distDir, '404.html'));
mkdirSync(resolve(distDir, 'admin'), { recursive: true });
cpSync(resolve(distDir, 'index.html'), resolve(distDir, 'admin', 'index.html'));
cpSync(resolve(projectDir, 'config.json'), resolve(distDir, 'config.json'));
console.log('[postbuild] admin/index.html, 404.html, and config.json created');
