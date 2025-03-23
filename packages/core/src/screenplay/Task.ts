import { ImplementationPendingError } from '../errors';
import type { PerformsActivities } from './activities';
import { Activity } from './Activity';
import type { Answerable } from './Answerable';

/**
 * **Tasks** model **[sequences of activities](https://serenity-js.org/api/core/class/Activity/)**
 * and help you capture meaningful steps of an [actor](https://serenity-js.org/api/core/class/Actor/) workflow
 * in your domain.
 *
 * Typically, tasks correspond to higher-level, business domain-specific activities
 * like to `BookAPlaneTicket`, `PlaceATrade`, `TransferFunds`, and so on.
 * However, higher-level tasks can and should be composed of lower-level tasks.
 * For example, a task to `SignUp` could be composed of tasks to `ProvideUsername` and `ProvidePassword`.
 *
 * The lowest-level tasks in your abstraction hierarchy should be composed of [interactions](https://serenity-js.org/api/core/class/Interaction/).
 * For example, a low-level task to `ProvideUsername` could be composed of an interaction to [enter](https://serenity-js.org/api/web/class/Enter/) the value
 * into a form field and [press](https://serenity-js.org/api/web/class/Press/) the [`Key.Enter`](https://serenity-js.org/api/web/class/Key/#Enter).
 *
 * Tasks are the core building block of the [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern),
 * along with [actors](https://serenity-js.org/api/core/class/Actor/), [abilities](https://serenity-js.org/api/core/class/Ability/), [interactions](https://serenity-js.org/api/core/class/Interaction/), and [questions](https://serenity-js.org/api/core/class/Question/).
 *
 * ![Screenplay Pattern](https://serenity-js.org/images/design/serenity-js-screenplay-pattern.png)
 *
 * Learn more about:
 * - [User-Centred Design: How a 50 year old technique became the key to scalable test automation](https://janmolak.com/user-centred-design-how-a-50-year-old-technique-became-the-key-to-scalable-test-automation-66a658a36555)
 * - [Actors](https://serenity-js.org/api/core/class/Actor/)
 * - [Activities](https://serenity-js.org/api/core/class/Activity/)
 * - [Interactions](https://serenity-js.org/api/core/class/Interaction/)
 *
 * ## Defining a task
 *
 * ```ts
 * import { Answerable, Task, the } from '@serenity-js/core'
 * import { By, Click, Enter, PageElement, Press, Key } from '@serenity-js/web'
 *
 * const SignIn = (username: Answerable<string>, password: Answerable<string>) =>
 *   Task.where(the`#actor signs is as ${ username }`,
 *     Enter.theValue(username).into(PageElement.located(By.id('username'))),
 *     Enter.theValue(password).into(PageElement.located(By.id('password'))),
 *     Press.the(Key.Enter),
 *   );
 * ```
 *
 * ## Defining a not implemented task
 *
 * Note that calling [`Task.where`](https://serenity-js.org/api/core/class/Task/#where) method without providing the sequence of [activities](https://serenity-js.org/api/core/class/Activity/)
 * produces a Task that's marked as "pending" in the test report.
 *
 * This feature is useful when you want to quickly write down a task that will be needed in the scenario,
 * but you're not yet sure what activities it will involve.
 *
 * ```ts
 * import { Task, the } from '@serenity-js/core'
 *
 * const SignUp = () =>
 *     Task.where(the`#actor signs up for a newsletter`) // no activities provided
 *                                                       // => task marked as pending
 * ```
 *
 * ## Composing activities into tasks
 *
 * The purpose of **tasks** is to help you capture domain vocabulary by **associating domain meaning** with a **sequence of activities**.
 * From the implementation perspective, tasks help you give a **meaningful description** to such sequence
 * and provide a way to **easily reuse activities across your code base**.
 *
 * :::tip Remember
 * **Tasks** associate **domain meaning** with a sequence of **lower-level activities** and provide a mechanism for **code reuse**.
 * :::
 *
 * For example, a task to _find a flight connection from London to New York_ could be modelled as a sequence of the following lower-level activities:
 * - specify origin city of "London"
 * - specify destination city of "New York"
 *
 * The easiest way to implement such task, and any custom Serenity/JS task for this matter, is to use the [`Task.where`](https://serenity-js.org/api/core/class/Task/#where) method to compose the lower-level activities:
 *
 * ```typescript
 * import { Task, the } from '@serenity-js/core'
 *
 * const findFlight = (originCity: string, destinationCity: string) =>
 *     Task.where(the`#actor finds a flight from ${ originCity } to ${ destinationCity }`,   // task goal
 *         specifyOriginCity(originCity),                                                  // activities
 *         specifyDestinationCity(originCity),
 *     )
 * ```
 *
 * Furthermore, if the actor was interacting with a web UI, a task to _specify origin city_ could again be composed of other activities:
 * - click on the `origin airport` widget
 * - enter city name of `London`
 * - pick the first suggested airport from the list
 *
 * Conversely, a task to _specify destination city_ could be composed of:
 * - click on the `destination airport` widget
 * - enter city name of `New York`
 * - pick the first suggested airport from the list
 *
 * Conveniently, [Serenity/JS modules](https://serenity-js.org/handbook/architecture/) provide low-level activities that
 * allow actors to interact with the various interfaces of the system under test.
 * For example, [Serenity/JS Web module](https://serenity-js.org/api/web) ships with activities such as [`Click`](https://serenity-js.org/api/web/class/Click/) or [`Enter`](https://serenity-js.org/api/web/class/Enter/),
 * which we can incorporate into our task definitions just like any other activities:
 *
 * ```typescript
 * import { Task, the } from '@serenity-js/core'
 * import { Click, Enter, Key, Press } from '@serenity-js/web'
 *
 * import { FlightFinder } from './ui/flight-finder'
 *
 * const specifyOriginCity = (originCity: string) =>
 *     Task.where(the`#actor specifies origin city of ${ originCity }`,
 *         Click.on(FlightFinder.originAirport),
 *         Enter.theValue(originCity).into(FlightFinder.originAirport),
 *         Press.the(Key.ArrowDown, Key.Enter).into(FlightFinder.originAirport),
 *     )
 *
 * const specifyDestinationCity = (destinationCity: string) =>
 *     Task.where(the`#actor specifies destination city of ${ destinationCity }`,
 *         Click.on(FlightFinder.destinationAirport),
 *         Enter.theValue(destinationCity).into(FlightFinder.destinationAirport),
 *         Press.the(Key.ArrowDown, Key.Enter).into(FlightFinder.destinationAirport),
 *     )
 * ```
 *
 * As you can already see, tasks to _specify origin city_ and _specify destination city_ are almost identical,
 * save for the name of the widget and the text value the actor is supposed to enter.
 * Serenity/JS **task-based code reuse model** means that we can clean up such duplicated implementation
 * by **extracting a parameterised task**, in this case called `specifyCity`:
 *
 * ```typescript
 * import { Task, the } from '@serenity-js/core'
 * import { Click, Enter, Key, PageElement, Press } from '@serenity-js/web'
 *
 * import { FlightFinder } from './ui/flight-finder'
 *
 * const specifyOriginCity = (originCity: string) =>
 *     Task.where(the`#actor specifies origin city of ${ originCity }`,
 *         specifyCity(originCity, FlightFinder.originAirport)
 *     )
 *
 * const specifyDestinationCity = (destinationCity: string) =>
 *     Task.where(the`#actor specifies destination city of ${ destinationCity }`,
 *         specifyCity(destinationCity, FlightFinder.destinationAirport),
 *     )
 *
 * const specifyCity = (cityName: string, widget: PageElement) =>
 *     Task.where(the`#actor specifies city of ${ cityName } in ${ widget }`,
 *         Click.on(widget),
 *         Enter.theValue(cityName).into(widget),
 *         Press.the(Key.ArrowDown, Key.Enter).into(widget),
 *     )
 * ```
 *
 * As you work with Serenity/JS, you'll notice that the ideas of **functional decomposition**, so thinking of tasks as sequences of lower-level activities,
 * as well as **functional composition**, so implementing reusable activities and composing them into higher-level tasks,
 * are at the heart of the Screenplay Pattern. You'll also notice that the entire Serenity/JS framework does it best to help your team follow this approach.
 *
 * :::info The power of the Serenity/JS task-based code reuse model
 * What makes the Serenity/JS task-based code reuse model so **powerful at scale** is the observation that:
 * - for most software systems, a vast number of **diverse test scenarios** can be composed of a relatively **small number of high-level activities**
 * - all **high-level activities** can be composed of a relatively **small number of lower-level activities**
 * - in a reasonably consistently-designed software system, most lower-level activities tend to be similar and rather consistent across the various aspects of a given interface.
 * In particular, **there are only so many ways** one can interact with a UI button or send an HTTP request to a web service.
 *
 * What this means in practice is that by investing your time in properly designing **relatively few reusable tasks**
 * to test your system, you give your team a **significant productivity boost** and **leverage** when producing high-level test scenarios.
 *
 * On top of that, this design approach results not only in **simpler test scenarios** that reduce
 * the [cognitive load](https://en.wikipedia.org/wiki/Cognitive_load) on the reader as they require them to process
 * the scenario only one level of abstraction at the time.
 * It also allows for the test to **take shortcuts** in well-defined points of the workflow - use a REST API request to create
 * a test user account instead of going through the registration form.
 * :::
 *
 * @group Screenplay Pattern
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
    static where(description: Answerable<string>, ...activities: Activity[]): Task {
        return activities.length > 0
            ? new DynamicallyGeneratedTask(description, activities)
            : new NotImplementedTask(description);
    }

    /**
     * Instructs the provided [`Actor`](https://serenity-js.org/api/core/class/Actor/) to perform this [`Task`](https://serenity-js.org/api/core/class/Task/).
     *
     * @param {PerformsActivities} actor
     *
     * #### Learn more
     * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
     * - [`PerformsActivities`](https://serenity-js.org/api/core/interface/PerformsActivities/)
     * - [`Activity`](https://serenity-js.org/api/core/class/Activity/)
     */
    abstract performAs(actor: PerformsActivities): Promise<void>;
}

/**
 * @package
 */
class DynamicallyGeneratedTask extends Task {
    constructor(description: Answerable<string>, private activities: Activity[]) {
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
    constructor(description: Answerable<string>) {
        super(description, Task.callerLocation(4));
    }

    performAs(actor: PerformsActivities): Promise<void> {
        return Promise.reject(
            new ImplementationPendingError(`A task where "${ this.toString() }" has not been implemented yet`),
        );
    }
}
