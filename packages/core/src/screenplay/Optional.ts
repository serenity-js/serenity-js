import { Answerable } from './Answerable';

export interface Optional {
    isPresent(): Answerable<boolean>;
}
