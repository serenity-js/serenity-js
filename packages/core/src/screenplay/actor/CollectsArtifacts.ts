import { Artifact, Name } from '../../model';

/**
 * @desc
 *  Enables the {@link Actor} to collect {@link Artifact}s while the scenario is being executed
 *
 * @public
 */
export interface CollectsArtifacts {

    /**
     * @desc
     *  Makes the {@link Actor} collect an {@link Artifact} so that it can be included in the test report.
     *
     * @type {function(artifact: Artifact, name?: Name): void}
     *
     * @see {@link Artifact} - The artifact to be collected, such as {@link JSONData}
     * @see {@link Name} - The name of the artifact to make it easy to recognise in the test report
     */
    collect: (artifact: Artifact, name?: Name) => void;
}
