import { createHash } from 'node:crypto';

import type { FullProject, TestCase, TestResult } from '@playwright/test/reporter';
import { CorrelationId } from '@serenity-js/core/lib/model';

export class PlaywrightSceneId extends CorrelationId {

    static override fromJSON(v: string): CorrelationId {
        return new PlaywrightSceneId(v);
    }

    static from(projectName: FullProject['name'], test: Pick<TestCase, 'id' | 'repeatEachIndex'>, result: Pick<TestResult, 'retry'>): CorrelationId {
        const projectId = createHash('sha1')
            .update(projectName)
            .digest('hex')
            .slice(0, 10);

        return new PlaywrightSceneId(`${ test.id }-${ projectId }-${ test.repeatEachIndex }-${ result.retry }`);
    }
}
