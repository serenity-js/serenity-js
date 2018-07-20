import { Timestamp } from '../domain/model';

export class Clock {
    now() {
        return new Timestamp();
    }
}
