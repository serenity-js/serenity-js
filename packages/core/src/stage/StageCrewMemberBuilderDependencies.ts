import type { OutputStream } from '../adapter/index.js';
import type { FileSystem } from '../io/index.js';
import type { Stage } from './Stage.js';

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
