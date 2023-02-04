import { AssertionError } from './model/AssertionError';
import { ConfigurationError } from './model/ConfigurationError';
import { ErrorSerialiser } from './ErrorSerialiser';
import { ImplementationPendingError } from './model/ImplementationPendingError';
import { LogicError } from './model/LogicError';
import { TestCompromisedError } from './model/TestCompromisedError';
import { TimeoutExpiredError } from './model/TimeoutExpiredError';
import { UnknownError } from './model/UnknownError';

ErrorSerialiser.registerErrorTypes(
    AssertionError,
    ConfigurationError,
    ImplementationPendingError,
    LogicError,
    TestCompromisedError,
    TimeoutExpiredError,
    UnknownError,
);

export { AssertionError } from './model/AssertionError';
export { ConfigurationError } from './model/ConfigurationError';
export { ErrorSerialiser } from './ErrorSerialiser';
export { ImplementationPendingError } from './model/ImplementationPendingError';
export { ListItemNotFoundError } from './model/ListItemNotFoundError';
export { LogicError } from './model/LogicError';
export { RuntimeError } from './model/RuntimeError';
export { TestCompromisedError } from './model/TestCompromisedError';
export { TimeoutExpiredError } from './model/TimeoutExpiredError';
export { UnknownError } from './model/UnknownError';

/* eslint-disable simple-import-sort/exports */
export { ErrorStackParser } from './ErrorStackParser';
export { ErrorOptions } from './ErrorOptions';
export { ErrorFactory } from './ErrorFactory';
/* eslint-enable simple-import-sort/exports */
