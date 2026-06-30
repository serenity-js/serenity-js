# REST API

This module demonstrates how Serenity/JS enables expressive, maintainable REST API testing using the Screenplay Pattern.

## Why REST API testing?

- Verify backend behaviour independently of the UI
- Faster execution than browser-based tests
- Essential for microservices and API-first architectures
- Enables blended testing (API for setup, UI for verification)

## Why Serenity/JS?

Serenity/JS provides:

- **Screenplay Pattern for APIs** – models HTTP interactions as Tasks performed by Actors with the `CallAnApi` ability
- **Rich reporting** – every HTTP request and response is captured as an artifact, showing method, URL, headers, status, and body directly in the activity tree
- **Composable assertions** – `Ensure.that(LastResponse.status(), equals(200))` reads like a specification
- **Blended testing** – combine API calls with UI interactions within the same scenario

## Features demonstrated

- HTTP interactions: GET, POST, PUT, DELETE, PATCH, HEAD requests via `Send.a(...)`
- Response inspection: status codes, headers, and body via `LastResponse`
- HTTP request/response artifacts captured and displayed in reports
- Proxy support for corporate environments
- `CallAnApi` ability configuration with base URL and custom headers
- Composing API calls into higher-level Tasks (e.g., authenticating, seeding test data)
