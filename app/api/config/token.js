// ============================================================
// CLOAKUP - Gerador de Token Bypass (estilo CloakUp/Clocap)
// Rota: POST /api/config/token
// ============================================================
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server.js';

const STORAGE_DIR = path.join(process.cwd(), '.cloaker');
const SECRET_PATH = path.join(STORAGE_DIR, 'bypass_secret.txt');

function getSecret() {
  try {
    if (fs.existsSync(SECRET_PATH)) {
      return fs.readFileSync(SECRET_PATH, 'utf8').trim();
    }
  } catch { /* ignore */ }

  // Gera novo segredo
  const crypto = await import('crypto');
  const secret = crypto.randomBytes(32).toString('base64');
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  fs.writeFileSync(SECRET_PATH, secret, 'utf8');
  return secret;
}

function generateToken(secret, payload) {
  const jwt = await import('jsonwebtoken');
  return jwt.jwt.sign(payload, secret, { expiresIn: payload.exp ? '30d' : '30d' });
}

export async function POST(request) {
  try {
    const secret = getSecret();
    const now = Date.now();
    const exp = now + 30 * 24 * 60 * 60 * 1000; // 30 dias

    const token = generateToken(secret, {
      type: 'bypass',
      created: now,
      exp: exp,
      source: 'cloakup-admin',
    });

    return NextResponse.json({ success: true, token, expiresIn: '30 days', secret: secret.length > 8 ? secret.slice(0, 8) + '***' : secret });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao gerar token', details: e.message }, { status: 500 });
  }
}
