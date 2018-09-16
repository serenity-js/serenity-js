import { Stage } from '@serenity-js/core/lib/stage';

/**
 * @desc Makes the {@link Stage} object set in the custom Cucumber World Constructor
 * visible in Cucumber step definitions.
 *
 * @see https://github.com/cucumber/cucumber-js/blob/v5.0.1/docs/support_files/api_reference.md
 * @see https://github.com/cucumber/cucumber-js/blob/v5.0.1/docs/support_files/step_definitions.md
 * @see https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters
 *
 * @example <caption>features/support/configure_serenity.ts</caption>
 * import { WithStage } from '@serenity-js/cucumber';
 * import { setWorldConstructor } from 'cucumber';
 *
 * setWorldConstructor(function(this: WithStage, { parameters }) {
 *   this.stage = serenity.callToStageFor(new SomeImplementationOfTheCastInterface());
 * });
 *
 * @example <caption>features/step_definitions/some.steps.ts</caption>
 * import { WithStage } from '@serenity-js/cucumber';
 *
 * Given(/(.*?) is a registered customer/, function(this: WithStage, actorName: string) {
 *   return this.stage.actor(actorName).attemptsTo(
 *
 *   );
 * });
 *
 * @interface
 */
export abstract class WithStage {
    stage: Stage;
}
