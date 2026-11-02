// language: JavaScript, file: app/api/lead/capture.js, target: Next.js 14, Vercel
// *API endpoint: POST /api/lead/capture — captura e-mail/telefone do lead.

import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server.js';

const STORAGE_DIR = path.join(process.cwd(), '.cloaker');
const LEADS_PATH = path.join(STORAGE_DIR, 'leads.json');

export async function POST(request) {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    const body = await request.json();
    const leads = fs.existsSync(LEADS_PATH) ? JSON.parse(fs.readFileSync(LEADS_PATH, 'utf8')) : [];

    leads.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      email: body.email,
      phone: body.phone || '',
      source: body.source || '-',
      createdAt: new Date().toISOString(),
    });

    fs.writeFileSync(LEADS_PATH, JSON.stringify(leads, null, 2));

    // Loga o lead no acesso
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'lead_captured', email: body.email, ip: request.headers.get('x-forwarded-for') || '-' }),
      });
    } catch { /* ignore */ }

    return NextResponse.json({ success: true, leadId: leads[leads.length - 1].id });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export default function handler(request) {
  return POST(request);
}
