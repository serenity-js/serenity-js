import { Task } from '@serenity-js/core';
import { Click } from '@serenity-js/web';

import { filterCalled, toggleAllButton } from '../TodoApp';

export const toggleAllItems = (): Task =>
    Task.where(`#actor toggles all items`,
        Click.on(toggleAllButton()),
    )

export const enableFilter = (state: 'All' | 'Active' | 'Completed'): Task =>
    Task.where(`#actor filters the list to show ${ state.toLowerCase() } items`,
        Click.on(filterCalled(state)),
    )
