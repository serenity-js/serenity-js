/**
 * @desc
 *  Information about the ordering (random or not) of this execution of the suite.
 *
 * @package
 */
export interface Order {
    random: boolean;
    seed: string;
    sort: (items: Array<{ id: number }>) => Array<{ id: number }>;
}
