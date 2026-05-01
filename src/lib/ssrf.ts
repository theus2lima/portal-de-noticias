/**
 * Proteção contra SSRF (Server-Side Request Forgery)
 *
 * Bloqueia requests para:
 * - IPs privados / loopback (RFC 1918)
 * - Cloud metadata endpoints (AWS 169.254.169.254, GCP, Azure, etc.)
 * - Esquemas não-HTTP (file://, ftp://, gopher://, etc.)
 * - Nomes de host internos (localhost, *.local, *.internal)
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.goog',
])

const BLOCKED_HOSTNAME_SUFFIXES = [
  '.local',
  '.internal',
  '.corp',
  '.lan',
  '.home',
  '.localdomain',
]

// Regex para detectar IPs privados / reservados
const PRIVATE_IP_PATTERNS = [
  // Loopback: 127.0.0.0/8
  /^127\./,
  // RFC 1918: 10.0.0.0/8
  /^10\./,
  // RFC 1918: 172.16.0.0/12
  /^172\.(1[6-9]|2\d|3[01])\./,
  // RFC 1918: 192.168.0.0/16
  /^192\.168\./,
  // Link-local / cloud metadata: 169.254.0.0/16
  /^169\.254\./,
  // IETF protocol assignments: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24
  /^192\.0\.2\./,
  /^198\.51\.100\./,
  /^203\.0\.113\./,
  // Documentation: 240.0.0.0/4
  /^24[0-9]\./,
  /^25[0-5]\./,
  // Broadcast
  /^255\./,
  // IPv6 loopback / private
  /^::1$/,
  /^fc00:/i,
  /^fd[0-9a-f]{2}:/i,
  /^fe80:/i,
  /^0\./,
]

export class SsrfBlockedError extends Error {
  constructor(reason: string) {
    super(`URL bloqueada por política de segurança: ${reason}`)
    this.name = 'SsrfBlockedError'
  }
}

/**
 * Valida se a URL é segura para fazer fetch do servidor.
 * Lança SsrfBlockedError se a URL for interna / perigosa.
 */
export function validateExternalUrl(rawUrl: string): URL {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new SsrfBlockedError('URL inválida')
  }

  // Apenas http e https são permitidos
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new SsrfBlockedError(`Esquema não permitido: ${parsed.protocol}`)
  }

  const hostname = parsed.hostname.toLowerCase()

  // Bloquear hostnames explicitamente proibidos
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new SsrfBlockedError(`Host interno: ${hostname}`)
  }

  // Bloquear sufixos internos
  for (const suffix of BLOCKED_HOSTNAME_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      throw new SsrfBlockedError(`Host interno (${suffix}): ${hostname}`)
    }
  }

  // Bloquear IPs privados/reservados
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new SsrfBlockedError(`IP reservado/privado: ${hostname}`)
    }
  }

  // Bloquear IPs literais IPv6 em notação bracket que não passaram nos regex acima
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    const ipv6 = hostname.slice(1, -1).toLowerCase()
    if (ipv6 === '::1' || ipv6.startsWith('fc') || ipv6.startsWith('fd') || ipv6.startsWith('fe80')) {
      throw new SsrfBlockedError(`IPv6 interno: ${ipv6}`)
    }
  }

  return parsed
}
