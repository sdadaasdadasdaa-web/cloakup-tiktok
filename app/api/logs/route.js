// ============================================================
// CLOAKUP - API de Logs (Auditoria em Tempo Real)
// ============================================================
import fs from 'fs';
import { NextResponse } from 'next/server.js';
import { STORAGE_DIR, storagePath } from '../storage.js';

const LOGS_PATH = storagePath('access.log');
const MAX_LOG_ENTRIES = 500;

export async function POST(request) {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    const entry = await request.json();
    const timestamp = new Date().toISOString();
    const logLine = JSON.stringify({
      ...entry,
      timestamp,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    }) + '\n';

    fs.appendFileSync(LOGS_PATH, logLine, 'utf8');

    // Rotação simples
    try {
      const stat = fs.statSync(LOGS_PATH);
      if (stat.size > 1024 * 1024) {
        const lines = fs.readFileSync(LOGS_PATH, 'utf8').split('\n').filter(Boolean);
        const kept = lines.slice(-MAX_LOG_ENTRIES);
        fs.writeFileSync(LOGS_PATH, kept.join('\n') + '\n', 'utf8');
      }
    } catch (e) { /* ignore */ }

    return NextResponse.json({ success: true, id: timestamp });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  if (!fs.existsSync(LOGS_PATH)) {
    return NextResponse.json({ logs: [], total: 0 });
  }

  try {
    const content = fs.readFileSync(LOGS_PATH, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    const recent = lines.slice(-limit).reverse().map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ logs: recent, total: lines.length });
  } catch (error) {
    return NextResponse.json({ logs: [], total: 0, error: error.message }, { status: 500 });
  }
}

export default function handler(request) {
  if (request.method === 'POST') return POST(request);
  return GET(request);
}
