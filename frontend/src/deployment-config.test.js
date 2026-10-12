import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

describe('production container configuration', () => {
  it('builds the Vite app and serves it with the configured health check', () => {
    const dockerfile = readFileSync(resolve(root, 'Containerfile'), 'utf8');
    expect(dockerfile).toContain('npm ci');
    expect(dockerfile).toContain('npm run build');
    expect(dockerfile).toContain('COPY --from=build /app/dist /usr/share/nginx/html');
    expect(dockerfile).toContain('http://127.0.0.1:8080/healthz');
  });

  it('serves health and falls back to the SPA entry point for client routes', () => {
    const nginx = readFileSync(resolve(root, 'nginx.conf'), 'utf8');
    expect(nginx).toContain('location = /healthz');
    expect(nginx).toContain('return 200 "ok\\n";');
    expect(nginx).toContain('try_files $uri $uri/ /index.html;');
  });
});
