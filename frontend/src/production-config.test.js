import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const dockerfile = readFileSync('Dockerfile', 'utf8');
const nginx = readFileSync('nginx.conf', 'utf8');
const nginxMain = readFileSync('nginx-main.conf', 'utf8');

describe('production container configuration', () => {
  it('builds the Vite bundle and serves it as an unprivileged Nginx process', () => {
    expect(dockerfile).toContain('RUN npm run build');
    expect(dockerfile).toContain('COPY --from=build /app/dist /usr/share/nginx/html');
    expect(dockerfile).toContain('USER 101:101');
    expect(dockerfile).toContain('EXPOSE 8080');
    expect(dockerfile).toContain('COPY nginx-main.conf /etc/nginx/nginx.conf');
    expect(nginxMain).toContain('pid /tmp/nginx.pid;');
  });

  it('provides a health endpoint and SPA route fallback', () => {
    expect(nginx).toMatch(/location = \/health[\s\S]*?return 200 "ok\\n";/);
    expect(nginx).toContain('try_files $uri $uri/ /index.html;');
  });
});
