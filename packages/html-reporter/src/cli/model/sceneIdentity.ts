import type { TagRecord } from './RunData.js';

/**
 * Computes a base identity for a scene from its source location or name.
 *
 * @package
 */
export function sceneIdentity(scene: { source: { path: string; line: number }; name: string }): string {
    return scene.source.line
        ? `${ scene.source.path }:${ scene.source.line }`
        : `${ scene.source.path }:${ scene.name }`;
}

/**
 * Computes a discriminator string from the browser, project, and platform tags.
 * Returns an empty string if no discriminator tags are present.
 *
 * @package
 */
export function tagDiscriminator(tags: TagRecord[]): string {
    const browserTag = tags.find(t => t.type === 'browser')?.name || '';
    const projectTag = tags.find(t => t.type === 'project')?.name || '';
    const platformTag = tags.find(t => t.type === 'platform')?.name || '';
    return [browserTag, projectTag, platformTag].filter(Boolean).join('@');
}

/**
 * Computes a full scene identity including tag-based discrimination.
 * Used to distinguish the same scenario running across different browsers,
 * projects, or platforms.
 *
 * @package
 */
export function sceneIdentityWithTags(scene: { source: { path: string; line: number }; name: string; tags: TagRecord[] }): string {
    const base = sceneIdentity(scene);
    const discriminator = tagDiscriminator(scene.tags);
    return discriminator ? `${ base }@${ discriminator }` : base;
}
