---
name: serenity-js-contributing-core-internals
description: "Known gotchas in the internals of @serenity-js/core: the dual-package hazard, the Stage's async operations, Question proxies and adapters. Use when changing packages/core, or a class other packages check with instanceof."
---

# Changing @serenity-js/core internals

How Actors, Activities and Questions are meant to be designed is in [docs/agents/screenplay-pattern.md](../../../docs/agents/screenplay-pattern.md).
This skill collects what the code doesn't make obvious.

## Implementation Gotchas

### `instanceof` checks must survive the dual-package hazard

Serenity/JS packages ship both CJS (`lib/`) and ESM (`esm/`) builds, and a single process can load both,
e.g. when WebdriverIO `import()`s the framework adapter while specs compiled to CommonJS `require()` the CJS build.
A class created by one copy fails a plain `instanceof` check against the other copy's class — which is how interactions ended up reported as tasks in #3535.
Classes checked with `instanceof` across packages must recognise instances created by the other copy:

- `Activity` (and so `Interaction` and `Task`), `Ability`, `Outcome` and `RuntimeError` implement `Symbol.hasInstance` with a `Symbol.for` type brand
- TinyType subclasses, including all domain events, get the same from `tiny-types`
- New classes that are checked with `instanceof` across package boundaries need a brand too

Unit-test cross-copy behaviour by loading a second copy of the module graph with tsx's `tsImport()`
(see `packages/core/spec/screenplay/Activity.spec.ts`). Integration reproductions need a `wdio.conf.ts`
with type-only imports — importing runtime values in the config loads the CJS copy first and hides the problem
(see `integration/webdriverio-mocha/examples/wdio.type-only-imports.conf.ts`).

### Async operations registered by the Stage must not wait for themselves

`StageManager.waitForAsyncOperationsToComplete()` resolves immediately when nothing is in progress.
Work that the `Stage` starts without awaiting it, like dismissing actors on `SceneFinishes`, must register
its async operations (`ActorStageExitAttempted`) **before** its first `await`, so that `waitForNextCue()`
sees them. If that work then waits for other operations to complete, it must exclude its own,
using `waitForAsyncOperationsToComplete({ except: [...] })` — otherwise it waits for itself until the cue timeout.
Keep the work-in-progress registry as the single record of pending work: a separately tracked promise
bypasses the cue timeout and hangs `waitForNextCue()` when the work never completes.

### Adding `metaQuestionBody` to `Question.about()` changes the proxy inspect output

When you pass a third argument (metaQuestionBody) to `Question.about()`, the underlying statement becomes a `MetaQuestionStatement` instead of a `QuestionStatement`. This changes `util.inspect` output of the proxy from `Proxy<QuestionStatement>` to `Proxy<MetaQuestionStatement>`. Any integration test that asserts on error messages containing the inspect representation will fail. Search for `Proxy<QuestionStatement>` in `integration/web-specs/spec/expectations/` when making such changes.

### QuestionAdapter proxy `apply` trap must unwrap Screenplay return types

When a proxy-forwarded method call returns a `Question` or `Task` (e.g., an Interaction Object method returning `QuestionAdapter<string>` or `Task`), the `apply` trap must unwrap it — resolve Questions via `actor.answer()` and perform Activities via `performAs()`. Without this, the proxy double-wraps the result in another `QuestionAdapter`, causing `Ensure.that()` to receive a proxy object instead of the resolved value.

This was not needed before `.as(Constructor)` because proxy forwarding only targeted primitives (`string`, `number`, `Array`) whose methods return plain values.

### `AnswerQuestions.answer()` does not recursively unwrap Promise<Question>

When `actor.answer()` receives a Promise, it returns the Promise as-is — it does not check whether the resolved value is itself a Question. This means double-wrapped `QuestionAdapter<QuestionAdapter<T>>` won't resolve correctly through `actor.answer()` alone. The unwrapping must happen at the source (the proxy `apply` trap), not in the resolution pipeline.

### `Question` is not PromiseLike — `Awaited` does not unwrap `QuestionAdapter`

`Question<T>` extends `Describable`, not `PromiseLike`. Therefore `Awaited<QuestionAdapter<string>>` does NOT collapse to `string` — it stays as `QuestionAdapter<string>`. The `UnwrapQuestionResult` conditional type was needed in `QuestionAdapterFieldDecorator` to prevent `QuestionAdapter<QuestionAdapter<T>>` at the type level.

### Detecting ES6 classes: use `mapping.prototype`, not error message matching

ES6 classes throw `TypeError: Class constructor X cannot be invoked without 'new'` when called as a function. Matching the error message string is fragile across V8 versions. Instead, check `mapping.prototype` — arrow functions don't have one, so a `TypeError` from a function with a `prototype` strongly indicates a class.

The function-first order matters: `Number(42)` returns a primitive, but `new Number(42)` returns a wrapper object. Call as function first, fall back to `new`.
