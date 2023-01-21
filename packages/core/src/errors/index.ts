import { AssertionError } from './AssertionError';
import { ConfigurationError } from './ConfigurationError';
import { ErrorSerialiser } from './ErrorSerialiser';
import { ImplementationPendingError } from './ImplementationPendingError';
import { LogicError } from './LogicError';
import { TestCompromisedError } from './TestCompromisedError';
import { TimeoutExpiredError } from './TimeoutExpiredError';
import { UnknownError } from './UnknownError';

// todo: can I simplify this to avoid explicit registration?
ErrorSerialiser.registerErrorTypes(
    AssertionError,
    ConfigurationError,
    ImplementationPendingError,
    LogicError,
    TestCompromisedError,
    TimeoutExpiredError,
    UnknownError,
);

export { AssertionError } from './AssertionError';
export { ConfigurationError } from './ConfigurationError';
export { ErrorSerialiser } from './ErrorSerialiser';
export { ImplementationPendingError } from './ImplementationPendingError';
export { ListItemNotFoundError } from './ListItemNotFoundError';
export { LogicError } from './LogicError';
export { RuntimeError } from './RuntimeError';
export { TestCompromisedError } from './TestCompromisedError';
export { TimeoutExpiredError } from './TimeoutExpiredError';
export { UnknownError } from './UnknownError';

/* eslint-disable simple-import-sort/exports */
export { ErrorStackParser } from './ErrorStackParser';
export { ErrorOptions } from './ErrorOptions';
export { ErrorFactory } from './ErrorFactory';
/* eslint-enable simple-import-sort/exports */
