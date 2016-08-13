export const conditionally = <T>(
    whenTrue: (arg: T) => Promise<T>,
    whenFalse: (arg: T) => Promise<T> = ((arg: T) => Promise.resolve<T>(arg))
) => (truthy: T) => {

    return !! truthy
        ? whenTrue(truthy)
        : whenFalse(truthy);
};
