/* eslint-disable unicorn/filename-case */
import { JSONObject } from 'tiny-types';

export interface DTO {
    type: string;
    value: JSONObject;
}
