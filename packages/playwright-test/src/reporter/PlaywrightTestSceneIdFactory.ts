import type { CorrelationIdFactory } from '@serenity-js/core/lib/model';
import { CorrelationId } from '@serenity-js/core/lib/model';

export class PlaywrightTestSceneIdFactory implements CorrelationIdFactory {
    private testId: CorrelationId;

    setTestId(testId: string): void {
        this.testId = new CorrelationId(testId);
    }

    create(): CorrelationId {
        return this.testId;
    }
}
