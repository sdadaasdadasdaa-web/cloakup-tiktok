// language: JavaScript, file: app/api/lead/route.js, target: Next.js 14, Vercel
// *API endpoint: POST /api/lead/capture — captura e-mail/telefone do lead.
//  GET /api/lead — lista leads (opcional)

import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server.js';
import { STORAGE_DIR, storagePath } from '../storage.js';

const LEADS_PATH = storagePath('leads.json');

export async function POST(request) {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    const body = await request.json();
    const leads = fs.existsSync(LEADS_PATH) ? JSON.parse(fs.readFileSync(LEADS_PATH, 'utf8')) : [];

    const newLead = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      email: body.email,
      phone: body.phone || '',
      campaign_id: body.campaign_id || 'general',
      source: body.source || '-',
      ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
      createdAt: new Date().toISOString(),
    };

    leads.push(newLead);
    fs.writeFileSync(LEADS_PATH, JSON.stringify(leads, null, 2));

    // Loga o lead no acesso
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'lead_captured', email: body.email, ip: newLead.ip }),
      });
    } catch { /* ignore */ }

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaign_id');

  if (!fs.existsSync(LEADS_PATH)) {
    return NextResponse.json({ leads: [], total: 0 });
  }

  try {
    const leads = JSON.parse(fs.readFileSync(LEADS_PATH, 'utf8'));
    const filtered = campaignId ? leads.filter(l => l.campaign_id === campaignId) : leads;
    return NextResponse.json({ leads: filtered, total: filtered.length });
  } catch (error) {
    return NextResponse.json({ leads: [], total: 0, error: error.message }, { status: 500 });
  }
}

export default function handler(request) {
  if (request.method === 'POST') return POST(request);
  return GET(request);
}
