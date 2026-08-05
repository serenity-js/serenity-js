import { existsSync, readFileSync, statSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { extname, join } from 'node:path';

export const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webm': 'video/webm',
    '.mp4': 'video/mp4',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ico': 'image/x-icon',
};

export function getNetworkAddress() {
    const interfaces = networkInterfaces();
    for (const entries of Object.values(interfaces)) {
        for (const entry of entries || []) {
            if (entry.family === 'IPv4' && !entry.internal) {
                return entry.address;
            }
        }
    }
    return undefined;
}

export function handleRequest(req, res, dir, host, port) {
    const url = new URL(req.url, `http://${host}:${port}`);
    let pathname = decodeURIComponent(url.pathname);

    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = join(dir, pathname);

    // Security: prevent directory traversal
    if (!filePath.startsWith(dir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    try {
        if (!existsSync(filePath) || !statSync(filePath).isFile()) {
            // SPA fallback: serve index.html for non-file paths
            const indexPath = join(dir, 'index.html');
            const content = readFileSync(indexPath);
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
            return;
        }

        const content = readFileSync(filePath);
        const ext = extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
        });
        res.end(content);
    } catch (error) {
        res.writeHead(500);
        res.end('Internal Server Error');
    }
}
