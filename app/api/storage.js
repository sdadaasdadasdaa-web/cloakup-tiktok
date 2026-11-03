// ============================================================
// CLOAKUP - Storage
// Armazenamento persistente writeable em Vercel (FS serverless é read-only, exceto /tmp)
// ============================================================
import fs from 'fs';
import { join } from 'path';

// prioridade:
//   1) variavel de ambiente (testes/CI) -> sempre
//   2) /tmp/.cloaker -> runtime serverless (Vercel) writeable
//   3) .cloaker do projeto -> dev local SO apenas se writeable
//   (em containers serverless .cloaker do projeto fica read-only -> EPERM -> 500)
const projectDir = process.cwd();
const inProject = join(projectDir, '.cloaker');
const tmpDir = join('/tmp', '.cloaker');

export const STORAGE_DIR = (() => {
  // 1) variável de ambiente (testes/CI)
  if (process.env.CLOAKER_STORAGE) {
    return process.env.CLOAKER_STORAGE;
  }
  // 2) /tmp/.cloaker - writeable no runtime serverless (Vercel/Netlify)
  if (fs.existsSync(tmpDir)) {
    try {
      fs.accessSync(tmpDir, fs.constants.W_OK);
      return tmpDir;
    } catch {
      // sem permissão, continua pro proximo
    }
  }
  // 3) .cloaker do projeto - dev local, SO se writeable
  if (fs.existsSync(inProject)) {
    try {
      fs.accessSync(inProject, fs.constants.W_OK);
      return inProject;
    } catch {
      // read-only (container serverless) -> ignora
    }
  }
  // fallback
  return tmpDir;
})();

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
  const fallback = STORAGE_DIR === tmpDir ? inProject : tmpDir;
  return join(fallback, file.replace(/^\//, ''));
}
