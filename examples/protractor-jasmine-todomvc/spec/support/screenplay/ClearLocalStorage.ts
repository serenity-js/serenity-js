import { Task } from '@serenity-js/core';
import { ExecuteScript } from '@serenity-js/protractor';

export const ClearLocalStorage = () =>
    Task.where(`#actor clears local storage`,
        ExecuteScript.sync('window.localStorage.clear()'),
    );
