const search            = new URL(document.currentScript.src).search.substring(1)
const stringPreparation = decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')
const qs                = JSON.parse('{"' + stringPreparation + '"}')

function extract(object, ...keys) {
    return keys.reduce((acc, key) => {
        acc[key] = object[key];
        return acc;
    }, {});
}

/**
 * @param {UIEvent} event
 */
function simplified(event) {

    if (event instanceof KeyboardEvent) {
        return extract(event, 'type', 'code', 'altKey', 'shiftKey', 'ctrlKey', 'metaKey')
    }

    if (event instanceof MouseEvent) {
        return extract(event, 'type', 'button', 'buttons', 'altKey', 'shiftKey', 'ctrlKey', 'metaKey')
    }

    return extract(event, 'type')
}

function eventMonitor(elementId, eventNames = []) {
    window.events = window.events || {};
    window.events[elementId] = [];

    const element = document.getElementById(elementId);
    const monitor = document.createElement('ul');
    monitor.setAttribute('id', `${ elementId }-monitor`);
    monitor.setAttribute('style', `list-style: none; padding: 0; margin: 0;`);
    document.body.appendChild(monitor);

    function render(simplifiedEvent) {
        const li = document.createElement('li');

        const code = document.createElement('code');
        const pre = document.createElement('pre');
        pre.setAttribute('class', 'event-value')
        const text = document.createTextNode(JSON.stringify(simplifiedEvent, undefined, 0));

        pre.appendChild(text);
        code.appendChild(pre);

        li.appendChild(code);

        monitor.appendChild(li);
    }

    eventNames.forEach(eventName => {
        element.addEventListener(eventName, event => {
            const simplifiedEvent = simplified(event);
            window.events[elementId].push(simplifiedEvent);
            render(simplifiedEvent);
        });
    });
}

eventMonitor(qs.elementId, qs.events.split(','))
