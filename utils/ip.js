// ============================================================
// Utilitários de IP e Geolocalização
// ============================================================
import ipaddr from 'ipaddr.js';

/**
 * Tenta detectar o tipo de ASN do IP:
 * - 'residential': residencial/normal
 * - 'datacenter': datacenter/cloud
 * - 'hosting': hosting
 * - 'proxy': proxy/VPN
 * - 'unknown': não pôde detectar
 */
export function detectASN(ip) {
  try {
    const normalized = ipaddr.process(ip);
    if (!normalized.isValid()) return 'unknown';

    // IPs de loopback/link-local
    if (normalized.kind() === 'ipv6' && normalized.isIPv4MappedAddress()) {
      return 'unknown';
    }

    // Faixas privadas/locais = residencial
    const privateRanges = [
      '10.0.0.0/8',
      '172.16.0.0/12',
      '192.168.0.0/16',
      '127.0.0.0/8',
      '169.254.0.0/16',
      'fc00::/7',
    ];
    for (const range of privateRanges) {
      if (normalized.match(ipaddr.parseRange(range))) {
        return 'residential';
      }
    }

    // Detecção básica de datacenter via range conhecida
    // Nota: para produção, usar API de GeoIP (IPinfo, IPwhois, MaxMind)
    const knownDatacenterRanges = [
      // AWS
      '3.2.0.0/24', '13.32.0.0/15', '13.35.0.0/17', '15.177.0.0/18',
      '18.130.0.0/16', '18.136.0.0/14', '34.192.0.0/12', '35.72.0.0/13',
      // Azure
      '13.64.0.0/11', '20.0.0.0/11', '40.74.0.0/15', '52.136.0.0/13',
      // Google Cloud
      '35.184.0.0/13', '35.192.0.0/14', '35.196.0.0/15',
      // DigitalOcean
      '104.131.0.0/16', '104.236.0.0/14', '159.203.0.0/16',
      // Cloudflare (protection - deixar passar)
      '104.16.0.0/12', '172.64.0.0/13',
      // TikTok/ByteDance datacenters
      '47.246.0.0/16', '47.250.0.0/15', '52.223.196.0/24',
      // Proxies/VPN conhecidos (exemplos)
      '185.220.101.0/24', // Tor exit nodes
      '89.249.0.0/16',    // HVN hosting
    ];

    for (const range of knownDatacenterRanges) {
      if (normalized.match(ipaddr.parseRange(range))) {
        return 'datacenter';
      }
    }

    // Se não conseguiu classificar, assume residencial (mais permissivo)
    // Em produção, substitua por uma chamada a API de GeoIP
    return 'residential';
  } catch {
    return 'unknown';
  }
}

/**
 * Detecta se o IP é de datacenter/VPN/proxy
 */
export function detectDatacenterIP(ip) {
  const type = detectASN(ip);
  return type === 'datacenter' || type === 'hosting' || type === 'proxy';
}

/**
 * Extrai país do IP a partir de headers de CDN (Cloudflare, ALB, etc.)
 * Ou tenta via API pública (fallback lento)
 */
export async function getCountryFromRequest(request) {
  const headers = request.headers;
  let country = headers.get('cf-ipcountry') || headers.get('x-geocluster') ||
                headers.get('x-client-country') || headers.get('x-ipcountry') ||
                headers.get('cf-ipcc');

  if (country && /^[A-Z]{2}$/.test(country)) {
    return country.toUpperCase();
  }

  // Fallback via API pública (lento, usar com cache na produção)
  try {
    const ip = headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.socket?.remoteAddress?.replace('^::ffff:', '');
    if (ip) {
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await res.json();
      return data.country_code || null;
    }
  } catch {
    // ignore fallback failures
  }
  return null;
}

/**
 * Retorna o tipo de ASN de forma compatível (alias para detectASN)
 * Para futuras expansões, pode retornar um objeto com mais detalhes
 */
export function getASNType(ip) {
  return detectASN(ip);
}

/**
 * Verifica se o IP é válido
 */
export function isValidIP(ip) {
  try {
    ipaddr.process(ip);
    return true;
  } catch {
    return false;
  }
}
