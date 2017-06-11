import { ActivityFinished, ActivityStarts, RecordedActivity } from '@serenity-js/core/lib/domain';

import { Photographer } from './photographer';

export class TimingBehaviour {

    constructor(private before: TakingAPhoto, private after: TakingAPhoto) {
    }

    takeABeforePhoto(event: ActivityStarts, photographer: Photographer) {
        this.before.takeAPhoto(event.value, event.timestamp, photographer);
    }

    takeAnAfterPhoto(event: ActivityFinished, photographer: Photographer) {
        this.after.takeAPhoto(event.value.subject, event.timestamp, photographer);
    }
}

export interface TakingAPhoto {
    takeAPhoto(activity: RecordedActivity, timestamp: number, photographer: Photographer);
}

export class TakeAPhoto implements TakingAPhoto {
    takeAPhoto(activity: RecordedActivity, timestamp: number, photographer: Photographer) {
        photographer.photograph(activity, timestamp);
    }
}

export class NoPhoto implements TakingAPhoto {
    takeAPhoto(activity: RecordedActivity, timestamp: number, photographer: Photographer) {
        // no-op
    }
}
