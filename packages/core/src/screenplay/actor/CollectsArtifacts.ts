import { Artifact, Name } from '../../model';

/**
 * Describes an {@link Actor} who can collect {@link Artifact|Artifacts}, such as {@link Photo|Photos} or {@link JSONData},
 * while the scenario is being executed
 *
 * ## Learn more
 * - {@link Artifact}
 * - {@link Actor}
 *
 * @group Actors
 */
export interface CollectsArtifacts {

    /**
     * Makes the {@link Actor} collect an {@link Artifact} so that it can be included in the test report.
     *
     * @param artifact
     *  The artifact to be collected, such as {@link JSONData}
     *
     * @param name
     *  The name of the artifact to make it easy to recognise in the test report
     */
    collect(artifact: Artifact, name?: Name): void;
}
