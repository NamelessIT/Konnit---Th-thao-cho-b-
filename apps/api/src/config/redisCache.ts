import net from 'node:net';
import tls from 'node:tls';
import { env } from './env';

const COMMAND_TIMEOUT_MS = 250;

function getRedisUrl() {
  return env.REDIS_URL || '';
}

function encodeCommand(parts: string[]) {
  return `*${parts.length}\r\n${parts
    .map((part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`)
    .join('')}`;
}

function isCompleteResponse(buffer: Buffer) {
  const prefix = String.fromCharCode(buffer[0]);
  if (prefix === '+' || prefix === '-' || prefix === ':') {
    return buffer.includes('\r\n');
  }
  if (prefix !== '$') return false;

  const headerEnd = buffer.indexOf('\r\n');
  if (headerEnd === -1) return false;

  const length = Number.parseInt(buffer.subarray(1, headerEnd).toString('utf8'), 10);
  if (length === -1) return true;
  return buffer.length >= headerEnd + 2 + length + 2;
}

function parseResponse(buffer: Buffer): string | number | null {
  const prefix = String.fromCharCode(buffer[0]);
  const lineEnd = buffer.indexOf('\r\n');
  const line = buffer.subarray(1, lineEnd).toString('utf8');

  if (prefix === '-') throw new Error(line);
  if (prefix === '+') return line;
  if (prefix === ':') return Number.parseInt(line, 10);
  if (prefix !== '$') return null;

  const length = Number.parseInt(line, 10);
  if (length === -1) return null;
  const start = lineEnd + 2;
  return buffer.subarray(start, start + length).toString('utf8');
}

function sendCommand(parts: string[]): Promise<string | number | null> {
  const redisUrl = getRedisUrl();
  if (!redisUrl) return Promise.resolve(null);

  return new Promise((resolve) => {
    let settled = false;
    const url = new URL(redisUrl);
    const port = Number.parseInt(url.port || '6379', 10);
    const host = url.hostname;
    const password = decodeURIComponent(url.password || '');
    let awaitingAuth = Boolean(password);
    const socket =
      url.protocol === 'rediss:'
        ? tls.connect({ host, port, servername: host })
        : net.createConnection({ host, port });
    const chunks: Buffer[] = [];

    const finish = (value: string | number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      resolve(value);
    };

    const timer = setTimeout(() => finish(null), COMMAND_TIMEOUT_MS);

    socket.on('connect', () => {
      socket.write(password ? encodeCommand(['AUTH', password]) : encodeCommand(parts));
    });
    socket.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      if (!isCompleteResponse(buffer)) return;
      try {
        const value = parseResponse(buffer);
        if (awaitingAuth) {
          awaitingAuth = false;
          chunks.length = 0;
          if (value !== 'OK') {
            finish(null);
            return;
          }
          socket.write(encodeCommand(parts));
          return;
        }
        finish(value);
      } catch {
        finish(null);
      }
    });
    socket.on('error', () => finish(null));
  });
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  const raw = await sendCommand(['GET', key]);
  if (typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCachedJson(key: string, value: unknown, ttlSeconds: number) {
  if (ttlSeconds <= 0) return;
  await sendCommand(['SETEX', key, String(ttlSeconds), JSON.stringify(value)]);
}

export async function deleteCachedKeys(keys: string[]) {
  if (keys.length === 0) return;
  await sendCommand(['DEL', ...keys]);
}
