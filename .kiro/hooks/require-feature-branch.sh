#!/bin/bash
# Block commits on main/master branches.
# Forces the agent to always work on a feature branch.
EVENT=$(cat)
case "$EVENT" in
  *git*commit*) ;;
  *) exit 0 ;;
esac

BRANCH=$(git branch --show-current 2>/dev/null)
case "$BRANCH" in
  main|master)
    echo "BLOCKED: You are on '$BRANCH'. Create a feature branch first." >&2
    exit 2 ;;
esac
exit 0
