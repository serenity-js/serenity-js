import { Stage } from './Stage';
import { OutputStream } from '../io';

/**
 * @desc
 *  Dependencies injected by {@link Serenity} into {@link StageCrewMemberBuilder#build}
 *
 * @interface
 *
 * @see {@link StageCrewMemberBuilder}
 */
export interface StageCrewMemberBuilderDependencies {

    /**
     * @type {Stage}
     */
    stage: Stage;

    /**
     * @desc
     *
     * @type {OutputStream}
     */
    outputStream: OutputStream;
}
