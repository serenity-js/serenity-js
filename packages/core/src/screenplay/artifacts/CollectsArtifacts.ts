import { Artifact, Name } from '../../model';

/**
 * Describes an {@apilink Actor} who can collect {@apilink Artifact|Artifacts}, such as {@apilink Photo|Photos} or {@apilink JSONData},
 * while the scenario is being executed
 *
 * ## Learn more
 * - {@apilink Artifact}
 * - {@apilink Actor}
 *
 * @group Actors
 */
export interface CollectsArtifacts {

    /**
     * Makes the {@apilink Actor} collect an {@apilink Artifact} so that it can be included in the test report.
     *
     * @param artifact
     *  The artifact to be collected, such as {@apilink JSONData}
     *
     * @param name
     *  The name of the artifact to make it easy to recognise in the test report
     */
    collect(artifact: Artifact, name?: Name): void;
}
