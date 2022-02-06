import { equals } from './equals';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function assertions(chai, utils): void {
    equals(chai, utils);
}
