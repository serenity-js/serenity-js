import { ImplementationPendingError } from '../errors';
import { Activity } from './Activity';
import { PerformsActivities } from './actor';

/**
 * Serenity/JS Screenplay Pattern `Task` represents a sequence of {@apilink Activity|activities},
 * so {@apilink Interaction|interactions} and lower-level tasks, and models a logical step
 * of the business workflow you want your {@apilink Actor|actor} to perform.
 *
 * Typically, tasks correspond to higher-level, business domain-specific activities
 * such as one to `BookAPlaneTicket`, `PlaceATrade`, `TransferFunds`, and so on.
 *
 * Note that higher-level tasks can and should be composed of lower-level tasks.
 * For example, a task to `SignUp` could be composed of tasks to `ProvideUsername` and `ProvidePassword`.
 *
 * The lowest-level tasks in your abstraction hierarchy should be composed of {@apilink Interaction|interactions}.
 * For example, a low-level task to `ProvideUsername` could be composed of an interaction to {@apilink Enter} the value
 * into a form field and {@apilink Press} the {@apilink Key.Enter}.
 *
 * ## Defining a task
 *
 * ```ts
 * import { Answerable, Task, d } from '@serenity-js/core'
 * import { By, Click, Enter, PageElement, Press, Key } from '@serenity-js/web'
 *
 * const SignIn = (username: Answerable<string>, password: Answerable<string>) =>
 *   Task.where(d`#actor signs is as ${ username }`,
 *     Enter.theValue(username).into(PageElement.located(By.id('username'))),
 *     Enter.theValue(password).into(PageElement.located(By.id('password'))),
 *     Press.the(Key.Enter),
 *   );
 * ```
 *
 * ## Defining a not implemented task
 *
 * Note that calling {@apilink Task.where} method without providing the sequence of {@apilink Activity|activities}
 * produces a Task that's marked as "pending" in the test report.
 *
 * This feature is useful when you want to quickly write down a task that will be needed in the scenario,
 * but you're not yet sure what activities it will involve.
 *
 * ```ts
 * import { Task } from '@serenity-js/core'
 *
 * const SignUp = () =>
 *     Task.where(`#actor signs up for a newsletter`) // no activities provided
 *                                                    // => task marked as pending
 * ```
 *
 * ## Learn more
 * - [User-Centred Design: How a 50 year old technique became the key to scalable test automation](https://janmolak.com/user-centred-design-how-a-50-year-old-technique-became-the-key-to-scalable-test-automation-66a658a36555)
 * - {@apilink Interaction}
 * - {@apilink Activity}
 * - {@apilink Actor}
 *
 * @group Activities
 */
export abstract class Task extends Activity {

    /**
     * A factory method that makes defining custom tasks more convenient.
     *
     * @param description
     *  A description to be used when reporting this task
     *
     * @param activities
     *  A sequence of lower-level activities that constitute this task
     */
    static where(description: string, ...activities: Activity[]): Task {
        return activities.length > 0
            ? new DynamicallyGeneratedTask(description, activities)
            : new NotImplementedTask(description);
    }

    /**
     * Instructs the provided {@apilink Actor} to perform this {@apilink Task}.
     *
     * @param {PerformsActivities} actor
     *
     * #### Learn more
     * - {@apilink Actor}
     * - {@apilink PerformsActivities}
     * - {@apilink Activity}
     */
    abstract performAs(actor: PerformsActivities): Promise<void>;
}

/**
 * @package
 */
class DynamicallyGeneratedTask extends Task {
    constructor(description: string, private activities: Activity[]) {
        super(description, Task.callerLocation(4));
    }

    performAs(actor: PerformsActivities): Promise<void> {
        return actor.attemptsTo(...this.activities);
    }
}

/**
 * @package
 */
class NotImplementedTask extends Task {
    constructor(description: string) {
        super(description, Task.callerLocation(4));
    }

    performAs(actor: PerformsActivities): Promise<void> {
        return Promise.reject(
            new ImplementationPendingError(`A task where "${ this.toString() }" has not been implemented yet`),
        );
    }
}
