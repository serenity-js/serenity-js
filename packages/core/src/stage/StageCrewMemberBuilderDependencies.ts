import type { OutputStream } from '../adapter';
import type { FileSystem } from '../io';
import type { Stage } from './Stage';

/**
 * Dependencies injected by [`Serenity.configure`](https://serenity-js.org/api/core/class/Serenity/#configure) into [`StageCrewMemberBuilder.build`](https://serenity-js.org/api/core/interface/StageCrewMemberBuilder/#build)
 *
 * ## Learn more
 * - [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMemberBuilder/)
 *
 * @group Stage
 */
export interface StageCrewMemberBuilderDependencies {
    stage: Stage;
    fileSystem: FileSystem;
    outputStream: OutputStream;
}
