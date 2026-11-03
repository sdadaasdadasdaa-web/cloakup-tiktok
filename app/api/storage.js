// ============================================================
// CLOAKUP - Storage
// Armazenamento persistente writeable em Vercel (FS serverless é read-only, exceto /tmp)
// ============================================================
import fs from 'fs';
import { join } from 'path';

// prioridade: variavel de ambiente (testes/CI) > local do projeto (git) > /tmp (runtime Vercel)
const projectDir = process.cwd();
const inProject = join(projectDir, '.cloaker');
const tmpDir = join('/tmp', '.cloaker');

export const STORAGE_DIR = process.env.CLOAKER_STORAGE || (fs.existsSync(inProject) ? inProject : tmpDir);

export function ensureDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  return STORAGE_DIR;
}

export function storagePath(file) {
  return join(STORAGE_DIR, file.replace(/^\//, ''));
}

export function getFallbackPath(file) {
  // rota alternativa quando STORAGE_DIR nao tem o arquivo
  const fallback = process.env.CLOAKER_STORAGE === tmpDir ? inProject : tmpDir;
  return join(fallback, file.replace(/^\//, ''));
}
