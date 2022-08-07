import { OutputStream } from '../adapter';
import { Stage } from './Stage';

/**
 * Dependencies injected by [[Serenity.configure]] into [[StageCrewMemberBuilder.build]]
 *
 * ## Learn more
 * - {@link StageCrewMemberBuilder}
 *
 * @group Stage
 */
export interface StageCrewMemberBuilderDependencies {
    stage: Stage;
    outputStream: OutputStream;
}
