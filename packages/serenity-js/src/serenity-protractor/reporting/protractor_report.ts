import { JSONObject } from '@serenity-js/core/lib/io/json';

/**
 * A JSON object which needs to be returned to Protractor when SerenityProtractorFramework
 * is done with executing the tests.
 *
 * @link https://github.com/angular/protractor/blob/master/lib/frameworks/README.md#requirements
 */
export interface ProtractorReport extends JSONObject {
    /**
     * Number of failed scenarios
     */
    failedCount: number;

    /**
     * Results per scenario
     */
    specResults: ProtractorSceneReport[];
}

export interface ProtractorSceneReport extends JSONObject {
    /**
     * Scenario title
     */
    description: string;

    /**
     * Results per scenario step (i.e. Given/When/Then, or the )
     */
    assertions: ProtractorActivityReport[];

    /**
     * Scenario length in millis
     */
    duration: number;
}

export interface ProtractorActivityReport extends JSONObject {
    passed: boolean;
    errorMsg?: string;
    stackTrace?: string;
}
