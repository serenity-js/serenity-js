/* eslint-disable simple-import-sort/imports */
import { AssertionError, ConfigurationError, ImplementationPendingError, LogicError, OperationInterruptedError, TestCompromisedError, TimeoutExpiredError, UnknownError } from './model';
import { ErrorSerialiser } from './ErrorSerialiser';
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

export * from './diff';
export * from './model';

/* eslint-disable simple-import-sort/exports -- Keep this directive: export order matters to avoid circular dependency (ErrorFactory -> io -> screenplay/Question -> errors -> ErrorStackParser). Do not auto-fix. */
export { ErrorSerialiser } from './ErrorSerialiser';
export { ErrorStackParser } from './ErrorStackParser';
export { ErrorFactory } from './ErrorFactory';
export { ErrorOptions } from './ErrorOptions';
export * from './RaiseErrors';
/* eslint-enable simple-import-sort/exports */
