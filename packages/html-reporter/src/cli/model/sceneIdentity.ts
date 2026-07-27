import type { TagRecord } from './RunData.js';

/**
 * Computes a discriminator string from the module, browser, project, and platform tags.
 * Returns an empty string if no discriminator tags are present.
 *
 * Module is included because different CI jobs (e.g., webdriverio-8-web-devtools vs
 * webdriverio-8-web-webdriverio) can run the same test file with different configurations.
 * Without module discrimination, tests from different modules with the same source location
 * would be incorrectly merged as duplicates.
 *
 * @package
 */
export function tagDiscriminator(tags: TagRecord[]): string {
    const moduleTag = tags.find(t => t.type === 'module')?.name || '';
    const browserTag = tags.find(t => t.type === 'browser')?.name || '';
    const projectTag = tags.find(t => t.type === 'project')?.name || '';
    const platformTag = tags.find(t => t.type === 'platform')?.name || '';
    return [moduleTag, browserTag, projectTag, platformTag].filter(Boolean).join('@');
}

/**
 * Computes a unique identity for a scene from its source location and tags.
 * Used to identify and match the same scenario across different runs and modules.
 *
 * The identity includes:
 * - Source path and line number (or name if line is missing)
 * - Module tag (distinguishes same test in different CI jobs)
 * - Browser, project, and platform tags (distinguishes multi-variant scenarios)
 *
 * @package
 */
export function sceneIdentity(scene: { source: { path: string; line: number }; name: string; tags: TagRecord[] }): string {
    const base = scene.source.line
        ? `${ scene.source.path }:${ scene.source.line }`
        : `${ scene.source.path }:${ scene.name }`;
    const discriminator = tagDiscriminator(scene.tags);
    return discriminator ? `${ base }@${ discriminator }` : base;
}
