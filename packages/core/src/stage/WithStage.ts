import { Stage } from './Stage';

/**
 * @desc Makes the {@link Stage} object setup in your test runner configuration visible
 * to test steps or test scenarios.
 *
 * When using Cucumber, the {@link Stage} is typically set up using the Cucumber World Constructor.
 * When using Jasmine, the {@link Stage} is typically set up in the `beforeEach` step.
 *
 * @see https://github.com/cucumber/cucumber-js/blob/v5.0.1/docs/support_files/api_reference.md
 * @see https://github.com/cucumber/cucumber-js/blob/v5.0.1/docs/support_files/step_definitions.md
 * @see https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters
 *
 * @example <caption>Usage with Cucumber.js</caption>
 * // features/support/configure_serenity.ts
 * import { WithStage } from '@serenity-js/core';
 * import { setWorldConstructor } from 'cucumber';
 *
 * setWorldConstructor(function (this: WithStage, { parameters }) {
 *   this.stage = serenity.callToStageFor(new SomeImplementationOfTheCastInterface());
 * });
 *
 * // features/step_definitions/some.steps.ts
 * import { WithStage } from '@serenity-js/cucumber';
 *
 * Given(/(.*?) is a registered customer/, function (this: WithStage, actorName: string) {
 *   return this.stage.actor(actorName).attemptsTo(
 *
 *   );
 * });
 *
 * @example <caption>Usage with Jasmine</caption>
 * // spec/some.spec.ts
 * import { serenity, WithStage } from '@serenity-js/core';
 *
 * describe('Using the Stage', () => {
 *   beforeEach(function (this: WithStage) {
 *     this.stage = serenity.callToStageFor(new SomeImplementationOfTheCastInterface());
 *   });
 *
 *   it('makes it easy to access the Actors', function(this: WithStage) {
 *     return this.stage.theActorCalled('Barry').attemptsTo(
 *       // tasks
 *     );
 *   })
 * });
 *
 * @deprecated Please use serenity.actor() and serenity.actorInTheSpotlight() instead
 */
export interface WithStage {
    stage: Stage;
}
