/**
 * Describes an [`Actor`](https://serenity-js.org/api/core/class/Actor/) or a supporting class
 * that can be identified by a name.
 *
 * This is what enables [interactions](https://serenity-js.org/api/core/class/Interaction/)
 * and [questions](https://serenity-js.org/api/core/class/Question/) to access the name of the
 * [actor](https://serenity-js.org/api/core/class/Actor/) performing them, for example to associate
 * actor-specific state such as login credentials with the actor's name.
 *
 * ## Learn more
 *
 * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
 *
 * @group Actors
 */
export interface HasName {

    /**
     * The name identifying the [`Actor`](https://serenity-js.org/api/core/class/Actor/).
     */
    readonly name: string;
}
