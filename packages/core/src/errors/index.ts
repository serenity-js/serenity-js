/* eslint-disable simple-import-sort/imports */
import { AssertionError, ConfigurationError, ImplementationPendingError, LogicError, TestCompromisedError, TimeoutExpiredError, UnknownError } from './model';
import { ErrorSerialiser } from './ErrorSerialiser';
/* eslint-enable simple-import-sort/imports */

// todo: export ErrorSerialiser as an instance to avoid static method calls
ErrorSerialiser.registerErrorTypes(
    AssertionError,
    ConfigurationError,
    ImplementationPendingError,
    LogicError,
    TestCompromisedError,
    TimeoutExpiredError,
    UnknownError,
);

export * from './model';

/* eslint-disable simple-import-sort/exports */
export { ErrorSerialiser } from './ErrorSerialiser';
export { ErrorStackParser } from './ErrorStackParser';
export { ErrorOptions } from './ErrorOptions';
export { ErrorFactory } from './ErrorFactory';
/* eslint-enable simple-import-sort/exports */
