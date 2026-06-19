import { createHash } from 'node:crypto';

import { ConfigurationError } from '@serenity-js/core';
import type { ActivityRelatedArtifactGenerated, ArtifactGenerated } from '@serenity-js/core/events';
import type { FileSystem} from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';
import { Photo } from '@serenity-js/core/model';

/**
 * Writes artifacts (screenshots, videos, traces) immediately to the Test_Run_Directory.
 *
 * @package
 */
export class ArtifactWriter {
    private runDirectory: Path;
    private readonly artifactPaths = new Map<string, Path[]>(); // activityId.value → artifact paths
    private readonly sceneArtifactPaths = new Map<string, Path[]>(); // sceneId.value → artifact paths

    constructor(private readonly fileSystem: FileSystem) {
    }

    createRunDirectory(timestamp: string): void {
        this.runDirectory = Path.from('test-runs', timestamp);

        try {
            this.fileSystem.ensureDirectoryExistsAtSync(this.runDirectory);
        } catch (error) {
            throw new ConfigurationError(
                `Could not create test run directory at ${ this.fileSystem.resolve(this.runDirectory).value }`,
                error as Error,
            );
        }
    }

    write(event: ActivityRelatedArtifactGenerated): void {
        const artifact = event.artifact;
        const filename = this.generateFilename(event);
        const relativePath = this.runDirectory.join(filename);

        if (artifact instanceof Photo) {
            this.fileSystem.storeSync(relativePath, artifact.map(buffer => buffer), undefined);
        }

        // Track paths for later inclusion in db.json
        const key = event.activityId.value;
        const paths = this.artifactPaths.get(key) || [];
        paths.push(relativePath);
        this.artifactPaths.set(key, paths);
    }

    getArtifactPaths(): Map<string, Path[]> {
        return this.artifactPaths;
    }

    writeSceneArtifact(event: ArtifactGenerated): void {
        const artifact = event.artifact;
        if (!(artifact instanceof Photo)) {
            return;
        }

        const isVideo = event.name.value.includes('video') || event.name.value.endsWith('.webm');
        const extension = isVideo ? 'webm' : 'png';
        const hash = createHash('sha1').update(artifact.base64EncodedValue).digest('hex').slice(0, 10);
        const safeName = event.name.value.toLowerCase().replace(/[^\da-z-]/g, '-').slice(0, 64);
        const filename = Path.from(`video-${ safeName }-${ hash }.${ extension }`);
        const relativePath = this.runDirectory.join(filename);

        this.fileSystem.storeSync(relativePath, artifact.map(buffer => buffer), undefined);

        const key = event.sceneId.value;
        const paths = this.sceneArtifactPaths.get(key) || [];
        paths.push(relativePath);
        this.sceneArtifactPaths.set(key, paths);
    }

    getSceneArtifactPaths(): Map<string, Path[]> {
        return this.sceneArtifactPaths;
    }

    getRunDirectory(): Path {
        return this.runDirectory;
    }

    private generateFilename(event: ActivityRelatedArtifactGenerated): Path {
        const hash = createHash('sha1')
            .update(event.artifact.base64EncodedValue)
            .digest('hex')
            .slice(0, 10);

        const prefix = event.artifact instanceof Photo ? 'screenshot' : 'artifact';
        const extension = event.artifact instanceof Photo ? 'png' : 'json';
        const safeName = event.name.value
            .toLowerCase()
            .replace(/[^\da-z-]/g, '-')
            .slice(0, 64);

        return Path.from(`${ prefix }-${ safeName }-${ hash }.${ extension }`);
    }
}
