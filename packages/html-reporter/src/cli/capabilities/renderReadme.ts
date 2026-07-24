import { posix } from 'node:path';

import type { FileSystem } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';
import { Marked, parseInline } from 'marked';

import type { ReportCapabilityNode } from '../ReportData.js';

/**
 * @package
 */
export function findReadme(directoryPath: Path, projectFileSystem: FileSystem): Path | undefined {
    try {
        const entries = projectFileSystem.readdirSync(directoryPath);
        const readmeEntry = entries.find(entry => /^readme\.md$/i.test(entry));
        if (readmeEntry) {
            return directoryPath.join(Path.from(readmeEntry));
        }
    } catch {
        // Directory doesn't exist or isn't readable
    }
    return undefined;
}

/**
 * Renders markdown content as HTML with custom link transformation.
 *
 * Uses the standalone `parseInline` function from `marked` to render link
 * text tokens, rather than `this.parser.parseInline(tokens)`. The `this`
 * binding inside renderer methods is unreliable — on Linux CI (different
 * Node/Babel compilation), `this.parser` can be undefined when marked
 * invokes the renderer function without preserving the call context.
 * Using the standalone function eliminates the binding dependency entirely.
 *
 * @package
 */
export function renderReadmeHtml(
    content: string,
    currentNodePath: string,
    nodeMap: Map<string, ReportCapabilityNode>,
    displayName: string | undefined,
): string {
    const linkRenderer = buildLinkRenderer(currentNodePath, nodeMap);

    const instance = new Marked({
        renderer: {
            link: linkRenderer,
        },
    });

    let html = instance.parse(content, { async: false }) as string;
    if (displayName) {
        html = html.replace(/^\s*<h[12][^>]*>.*?<\/h[12]>\s*/i, '');
    }
    return html;
}

function buildLinkRenderer(
    currentNodePath: string,
    nodeMap: Map<string, ReportCapabilityNode>,
): (token: { href: string; title?: string | null; tokens: Array<{ raw: string }> }) => string {
    return ({ href, title, tokens }) => {
        const text = parseInline(tokens.map(t => t.raw).join('')) as string;
        const titleAttribute = title ? ` title="${title}"` : '';

        const resolved = resolveLocalHref(href, currentNodePath);

        if (resolved === undefined) {
            return buildExternalLink(href, titleAttribute, text);
        }

        return buildInternalLink(resolved, href, titleAttribute, text, nodeMap);
    };
}

function resolveLocalHref(href: string, currentNodePath: string): string | undefined {
    if (!href.startsWith('./') && !href.startsWith('../')) {
        return undefined;
    }

    const basePath = currentNodePath || '.';
    let resolved = posix.normalize(posix.join(basePath, href));

    if (resolved.startsWith('..')) {
        return undefined;
    }

    if (resolved === '.') {
        resolved = '';
    } else if (resolved.startsWith('./')) {
        resolved = resolved.substring(2);
    }

    if (/\/readme\.md$/i.test(resolved)) {
        resolved = resolved.replace(/\/readme\.md$/i, '');
    } else if (/^readme\.md$/i.test(resolved)) {
        resolved = '';
    }

    return resolved;
}

function buildExternalLink(href: string, titleAttribute: string, text: string): string {
    const targetAttribute = href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${href}"${titleAttribute}${targetAttribute}>${text}</a>`;
}

function buildInternalLink(
    resolved: string,
    href: string,
    titleAttribute: string,
    text: string,
    nodeMap: Map<string, ReportCapabilityNode>,
): string {
    const withoutTrailingSlash = resolved.replace(/\/$/, '');
    const isDirectoryLink = href.endsWith('/') || /\/readme\.md$/i.test(href) || /^\.\/readme\.md$/i.test(href) || nodeMap.has(withoutTrailingSlash);

    if (isDirectoryLink && nodeMap.has(withoutTrailingSlash)) {
        const capabilitiesHref = withoutTrailingSlash === ''
            ? '#/capabilities'
            : `#/capabilities?path=${encodeURIComponent(withoutTrailingSlash)}`;
        return `<a href="${capabilitiesHref}"${titleAttribute}>${text}</a>`;
    }

    if (isDirectoryLink) {
        return `<a href="${href}"${titleAttribute}>${text}</a>`;
    }

    if (/\.(spec|test)\.(ts|js|mjs|cjs)$/.test(resolved)) {
        const encodedSearch = encodeURIComponent('"' + withoutTrailingSlash + '"');
        return `<a href="#/tests?search=${encodedSearch}"${titleAttribute}>${text}</a>`;
    }

    return `<a href="${href}"${titleAttribute}>${text}</a>`;
}
