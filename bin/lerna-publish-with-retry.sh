#!/usr/bin/env bash
#
# Publishes every package whose version in package.json is not in the npm registry yet,
# retrying when npm or the Sigstore transparency log fail intermittently.
#
# Safe to retry: `lerna publish from-package` skips the packages that are published already,
# and it doesn't create any commits or tags.
#
# Usage: bin/lerna-publish-with-retry.sh [max_attempts] [extra lerna publish options...]

set -uo pipefail

max_attempts="${1:-3}"
shift || true

for attempt in $(seq 1 "$max_attempts"); do
    # Calls Lerna directly rather than via package.json, so that the script also works
    # when the workflow checks out an older release tag to publish its missing packages.
    if pnpm exec lerna publish from-package --yes --concurrency 2 "$@"; then
        exit 0
    fi

    if [ "$attempt" -lt "$max_attempts" ]; then
        delay=$(( attempt * 30 ))
        echo "::warning::npm publish attempt ${attempt} of ${max_attempts} failed, retrying in ${delay}s"
        sleep "$delay"
    fi
done

echo "::error::npm publish failed after ${max_attempts} attempts"
exit 1
