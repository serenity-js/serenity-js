import type { OutputStream } from '../adapter';
import type { FileSystem } from '../io';
import type { Stage } from './Stage';

/**
 * Dependencies injected by {@apilink Serenity.configure} into {@apilink StageCrewMemberBuilder.build}
 *
 * ## Learn more
 * - {@apilink StageCrewMemberBuilder}
 *
 * @group Stage
 */
export interface StageCrewMemberBuilderDependencies {
    stage: Stage;
    fileSystem: FileSystem;
    outputStream: OutputStream;
}
