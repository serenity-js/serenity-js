import { Timestamp } from '../model';

export class Clock {
    now() {
        return new Timestamp();
    }
}
