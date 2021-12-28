/**
 * @desc
 *  Maps an Array<Item_Type> to an Array<Result_Type>, one element at a time.
 *
 * @param {Array<Item_Type>} items
 * @param {function(item: Item_Type): Promise<Result_Type>} mappingFunction
 */
export function asyncMap<Item_Type, Result_Type>(items: Item_Type[], mappingFunction: (item: Item_Type) => Promise<Result_Type> | Result_Type): Promise<Result_Type[]> {
    return items.reduce(
        (previous, item) =>
            previous.then(async (acc) => {
                const result = await mappingFunction(item);

                return acc.concat(result);
            })
        , Promise.resolve([])
    );
}
