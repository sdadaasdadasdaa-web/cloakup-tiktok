// language: JavaScript, file: app/api/cloak/token.js, target: Next.js 14, Vercel
// *API endpoint: GET/POST /api/cloak/token — gera e valida token bypass estilo Clocap/CloakUp.
//  O token libera acesso independente de UA/dispositivo (modo emergencial, teste ou cliente VIP).
//  O token é assinado com segredo armazenado no config do cloaker.
//
//  POST /api/cloak/token  -> { success, token, secret, expires_in, usage }
//  GET  /api/cloak/token?token=XYZ -> { valid, payload }

import { NextResponse } from 'next/server.js';
import jwt from 'jsonwebtoken';
import { writeFileSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { STORAGE_DIR, storagePath } from '../storage.js';

const SECRET_PATH = storagePath('bypass_secret.txt');

export async function POST(request) {
  try {
    const secret = await ensureSecret();

    // O cliente pode mandar um payload customizado (ex: usuario identificador)
    let payload = {};
    try {
      const body = await request.json();
      payload = { ...body.payload, ...{ issued: Date.now(), origin: 'api' } };
    } catch {
      payload = { issued: Date.now(), origin: 'api' };
    }

    const token = jwt.sign(payload, secret, { expiresIn: '30d', algorithm: 'HS256' });

    return NextResponse.json({
      success: true,
      token,
      secret: secret.length > 8 ? secret.slice(0, 8) + '***' : secret,
      expires_in: '30d',
      usage: 'https://seusite.com/?bypass=' + token,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || searchParams.get('bypass');
  const secret = (await ensureSecret()) || 'default-secret-change-me';

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
