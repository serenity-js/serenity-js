import { Actor } from '../screenplay/actor';

/**
 * @desc Cast
 * @interface
 */
export abstract class Cast {
    abstract actor(name: string): Actor;
}
