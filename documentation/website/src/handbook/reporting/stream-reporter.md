---
title: Stream Reporter
layout: handbook.hbs
cta: cta-share
---
# Stream Reporter

[`StreamReporter`](/modules/core/class/src/stage/crew/stream-reporter/StreamReporter.ts~StreamReporter.html), available as part of the [`@serenity-js/core`](/modules/core) module, serialises [`DomainEvents`](/modules/core/class/src/events/DomainEvent.ts~DomainEvent.html) it receives to JSON and sends them to a [`Writable`](https://nodejs.org/docs/latest-v14.x/api/stream.html#stream_writable_streams) stream.

This service is useful for debugging any custom extensions you create for Serenity/JS, or debugging the framework itself.

## Installation

To install the module, run the following command in your computer terminal:

```bash
npm install --save-dev @serenity-js/core
```

## Integration

[`StreamReporter`](/modules/core/class/src/stage/crew/stream-reporter/StreamReporter.ts~StreamReporter.html) listens to any [`DomainEvents`](/modules/core/identifiers.html#events) emitted by [`Actors`](/handbook/design/actors.html) and Serenity/JS test runner adapters. It then streams them to a [`Writable`](https://nodejs.org/docs/latest-v14.x/api/stream.html#stream_writable_streams) stream, such as [`process.stdout`](https://nodejs.org/docs/latest-v14.x/api/process.html#process_process_stdout), or one created via [`fs.createWriteStream(filename)`](https://nodejs.org/docs/latest-v14.x/api/fs.html#fs_fs_createwritestream_path_options).

<div class="mermaid">
graph TB
    A(["fas:fa-users Actors"])
    TRA(["fas:fa-plug Serenity/JS test runner adapter"])

    S["Serenity"]
    SR[StreamReporter]
    T["fas:fa-terminal serialised events"]
    Log["fas:fa-file log.ndjson"]
    
    TRA -- notifies --> S
    A -- notify --> S

    subgraph "core"
    S -- notifies --> SR
    end

    SR -- prints --> T
    SR -- writes --> Log
    
    class A socket
    class TRA socket

    click A "/handbook/design/actors.html"
    click S "/modules/core"
    click SR "/modules/core/class/src/stage/crew/stream-reporter/StreamReporter.ts~StreamReporter.html"
</div>

## Usage

To use [`StreamReporter`](/modules/core/class/src/stage/crew/stream-reporter/StreamReporter.ts~StreamReporter.html), register it as one of the [`StageCrewMembers`](/modules/core/class/src/stage/StageCrewMember.ts~StageCrewMember.html):

```typescript
import { configure, StreamReporter } from '@serenity-js/core';
import * as fs from 'fs';

configure({
    crew: [
        new StreamReporter(fs.createWriteStream('events.ndjson')),
    ],
});
```

To learn more about the available configuration options, consult the [`StreamReporter` API docs](/modules/core/class/src/stage/crew/stream-reporter/StreamReporter.ts~StreamReporter.html) and its [test suite](/modules/core/test-file/spec/stage/crew/stream-reporter/StreamReporter.spec.ts.html).

You might also want to explore the [example projects](https://github.com/serenity-js/serenity-js/tree/master/examples).
