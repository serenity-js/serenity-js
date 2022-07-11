/**
 * https://developer.mozilla.org/en-US/docs/Web/WebDriver/Errors#table_of_errors
 * https://github.com/SeleniumHQ/selenium/blob/e70e22390000a65a6b706fbb33bbff8913555670/javascript/node/selenium-webdriver/lib/error.js#L441
 *
 * @package
 */
export enum WebdriverProtocolErrorCode {
    WebDriverError = 'unknown error',
    DetachedShadowRootError = 'detached shadow root',
    ElementClickInterceptedError = 'element click intercepted',
    ElementNotInteractableError = 'element not interactable',
    ElementNotSelectableError = 'element not selectable',
    InsecureCertificateError = 'insecure certificate',
    InvalidArgumentError = 'invalid argument',
    InvalidCookieDomainError = 'invalid cookie domain',
    InvalidCoordinatesError = 'invalid coordinates',
    InvalidElementStateError = 'invalid element state',
    InvalidSelectorError = 'invalid selector',
    NoSuchSessionError = 'invalid session id',
    JavascriptError = 'javascript error',
    MoveTargetOutOfBoundsError = 'move target out of bounds',
    NoSuchAlertError = 'no such alert',
    NoSuchCookieError = 'no such cookie',
    NoSuchElementError = 'no such element',
    NoSuchFrameError = 'no such frame',
    NoSuchShadowRootError = 'no such shadow root',
    NoSuchWindowError = 'no such window',
    ScriptTimeoutError = 'script timeout',
    SessionNotCreatedError = 'session not created',
    StaleElementReferenceError = 'stale element reference',
    TimeoutError = 'timeout',
    UnableToSetCookieError = 'unable to set cookie',
    UnableToCaptureScreenError = 'unable to capture screen',
    UnexpectedAlertOpenError = 'unexpected alert open',
    UnknownCommandError = 'unknown command',
    UnknownMethodError = 'unknown method',
    UnsupportedOperationError = 'unsupported operation',
}
