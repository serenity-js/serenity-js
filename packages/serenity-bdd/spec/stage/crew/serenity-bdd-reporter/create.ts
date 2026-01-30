import { EventRecorder } from '@integration/testing-tools';
import type { Actor, Cast } from '@serenity-js/core';
import { Clock, Duration, ErrorFactory, Stage, StageManager } from '@serenity-js/core';
import { FileSystem, Path } from '@serenity-js/core/lib/io';
import type { JSONObject } from 'tiny-types';

import type { SerenityBDDReporterConfig } from '../../../../src';
import { SerenityBDDReporter } from '../../../../src';

const { memfs } = require('memfs'); // Typings incorrectly assume the presence of "dom" lib

export const emptyWorkspace = { [`${ process.cwd() }`]: { } };

export function create(config: SerenityBDDReporterConfig = {}, fakeDirectoryStructure: JSONObject = emptyWorkspace): {
    stage: Stage,
    reporter: SerenityBDDReporter,
    recorder: EventRecorder
} {
    class Extras implements Cast {
        prepare(actor: Actor): Actor {
            return actor;
        }
    }

    const
        interactionTimeout  = Duration.ofSeconds(2),
        cueTimeout          = Duration.ofSeconds(1),
        clock               = new Clock(),
        stageManager        = new StageManager(cueTimeout, clock),
        stage               = new Stage(new Extras(), stageManager, new ErrorFactory(), clock, interactionTimeout),
        recorder            = new EventRecorder([], stage),
        cwd                 = Path.from(Object.keys(fakeDirectoryStructure)[0]);

    const reporter = SerenityBDDReporter
        .fromJSON(config)
        .build({
            stage,
            fileSystem: new FileSystem(cwd, memfs(fakeDirectoryStructure).fs),
            // SerenityBDDReporter doesn't use the outputStream, so we don't need it
            outputStream: undefined,
        });

    stage.assign(reporter, recorder);

    return {
        stage,
        reporter,
        recorder,
    };
}
