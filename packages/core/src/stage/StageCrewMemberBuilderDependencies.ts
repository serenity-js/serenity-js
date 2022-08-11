import { OutputStream } from '../adapter';
import { Stage } from './Stage';

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
    outputStream: OutputStream;
}
