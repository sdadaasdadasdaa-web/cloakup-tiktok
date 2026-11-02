// language: JavaScript, file: app/api/cloak/token.js, target: Next.js 14, Vercel
// *API endpoint: GET/POST /api/cloak/token — gera e valida token bypass estilo Clocap/CloakUp.
//  O token libera acesso independente de UA/dispositivo (modo emergencial, teste ou cliente VIP).
//  O token é assinado com segredo armazenado no config do cloaker.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';

const STORAGE_DIR = join(process.cwd(), '.cloaker');

export async function POST(request) {
  try {
    let secret = await readSecret();
    const oldSecret = secret;

    // O cliente pode mandar um payload customizado (ex: usuario identificador)
    let payload = {};
    try {
      const body = await request.json();
      payload = { ...body.payload, ...{ issued: Date.now(), origin: 'api' } };
    } catch {
      payload = { issued: Date.now(), origin: 'api' };
    }

    const token = jwt.sign(payload, secret, { expiresIn: '30d', algorithm: 'HS256' });

    if (!oldSecret) {
      writeFileSync(join(STORAGE_DIR, 'bypass_secret.txt'), secret, 'utf8');
    }

    return NextResponse.json({
      success: true,
      token,
      secret: oldSecret ? '(ja existente)' : secret,
      expires_in: '30d',
      usage: 'https://seusite.com/?bypass=' + token
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || searchParams.get('bypass');
  const secret = (await readSecret()) || 'default-secret-change-me';

  if (!token) {
    return NextResponse.json({ valid: false, reason: 'no_token' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, secret);
    return NextResponse.json({ valid: true, payload: decoded });
  } catch (e) {
    return NextResponse.json({ valid: false, reason: 'invalid_or_expired' }, { status: 401 });
  }
}

async function readSecret() {
  try {
    const data = await import('fs').then(m => m.readFileSync(join(STORAGE_DIR, 'bypass_secret.txt'), 'utf8'));
    return data.trim();
  } catch {
    return null;
  }
}
