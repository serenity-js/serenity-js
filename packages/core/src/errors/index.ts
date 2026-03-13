/* eslint-disable simple-import-sort/imports */
import { AssertionError, ConfigurationError, ImplementationPendingError, LogicError, OperationInterruptedError, TestCompromisedError, TimeoutExpiredError, UnknownError } from './model/index.js';
import { ErrorSerialiser } from './ErrorSerialiser.js';
/* eslint-enable simple-import-sort/imports */

// todo: export ErrorSerialiser as an instance to avoid static method calls
ErrorSerialiser.registerErrorTypes(
    AssertionError,
    ConfigurationError,
    ImplementationPendingError,
    LogicError,
    OperationInterruptedError,
    TestCompromisedError,
    TimeoutExpiredError,
    UnknownError,
);

export * from './diff/index.js';
export * from './model/index.js';

/* eslint-disable simple-import-sort/exports -- Keep this directive: export order matters to avoid circular dependency (ErrorFactory -> io -> screenplay/Question -> errors -> ErrorStackParser). Do not auto-fix. */
export { ErrorSerialiser } from './ErrorSerialiser.js';
export { ErrorStackParser } from './ErrorStackParser.js';
export { ErrorFactory } from './ErrorFactory.js';
export type { ErrorOptions } from './ErrorOptions.js';
export * from './RaiseErrors.js';
/* eslint-enable simple-import-sort/exports */
