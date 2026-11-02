// language: JavaScript, file: app/api/logs/index.js, target: Next.js 14, Vercel
// *API endpoint: GET /api/logs — retorna os logs de acesso do cloaker.
//  POST /api/logs — grava um novo log de acesso.

import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server.js';

const STORAGE_DIR = path.join(process.cwd(), '.cloaker');
const LOGS_PATH = path.join(STORAGE_DIR, 'access.log');
const MAX_LOG_ENTRIES = 2000;

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

    // Append ao log (rotação simples: mantem apenas os ultimos MAX entries em memoria tambem)
    fs.appendFileSync(LOGS_PATH, logLine, 'utf8');

    // Mantem log file com tamanho razoavel (corta os ultimos 500 se ultrapassar ~1MB)
    try {
      const stat = fs.statSync(LOGS_PATH);
      if (stat.size > 1024 * 1024) {
        const lines = fs.readFileSync(LOGS_PATH, 'utf8').split('\n').filter(Boolean);
        const kept = lines.slice(-500);
        fs.writeFileSync(LOGS_PATH, kept.join('\n') + '\n', 'utf8');
      }
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ success: true, id: timestamp });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

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
