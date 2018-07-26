import { Serialised } from 'tiny-types';

export interface DTO<T extends object> {
    type: string;
    value: Serialised<T>;
}
